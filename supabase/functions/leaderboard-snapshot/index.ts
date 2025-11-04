import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserXPData {
  user_id: string;
  total_xp: number;
  xp_7d: number;
  xp_30d: number;
  country: string | null;
  selected_papers: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    console.log("Starting leaderboard snapshot generation...");

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch all eligible users
    const { data: profiles, error: profilesError } = await supabaseClient
      .from("user_profiles")
      .select("user_id, total_xp, country, selected_papers")
      .gte("total_xp", 10)
      .eq("is_opted_out_of_leaderboard", false);

    if (profilesError) throw profilesError;
    if (!profiles || profiles.length === 0) {
      console.log("No eligible users found");
      return new Response(JSON.stringify({ message: "No users to process" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`Processing ${profiles.length} users...`);

    // Calculate XP windows for each user
    const usersWithXP: UserXPData[] = await Promise.all(
      profiles.map(async (profile) => {
        // Get XP events in the last 7 days
        const { data: xp7d } = await supabaseClient
          .from("xp_events")
          .select("xp_value")
          .eq("user_id", profile.user_id)
          .gte("created_at", sevenDaysAgo.toISOString());

        // Get XP events in the last 30 days
        const { data: xp30d } = await supabaseClient
          .from("xp_events")
          .select("xp_value")
          .eq("user_id", profile.user_id)
          .gte("created_at", thirtyDaysAgo.toISOString());

        return {
          user_id: profile.user_id,
          total_xp: profile.total_xp,
          xp_7d: xp7d?.reduce((sum, e) => sum + e.xp_value, 0) || 0,
          xp_30d: xp30d?.reduce((sum, e) => sum + e.xp_value, 0) || 0,
          country: profile.country,
          selected_papers: profile.selected_papers || [],
        };
      })
    );

    // Sort by total XP (with tie-breakers)
    const sortedUsers = usersWithXP.sort((a, b) => {
      if (b.total_xp !== a.total_xp) return b.total_xp - a.total_xp;
      if (b.xp_7d !== a.xp_7d) return b.xp_7d - a.xp_7d;
      return 0; // Could add created_at tie-breaker if needed
    });

    // Calculate global ranks and percentiles
    const totalUsers = sortedUsers.length;
    const snapshots = sortedUsers.map((user, index) => {
      const rank = index + 1;
      const percentile = ((totalUsers - rank) / totalUsers) * 100;

      return {
        user_id: user.user_id,
        xp_total: user.total_xp,
        xp_7d: user.xp_7d,
        xp_30d: user.xp_30d,
        rank_global: rank,
        percentile_global: Math.round(percentile * 100) / 100,
        rank_country: null as number | null,
        percentile_country: null as number | null,
        rank_paper: null as number | null,
        percentile_paper: null as number | null,
        paper_code: null as string | null,
        captured_on: now.toISOString().split("T")[0],
      };
    });

    // Calculate country ranks
    const countriesMap = new Map<string, UserXPData[]>();
    usersWithXP.forEach((user) => {
      if (user.country) {
        if (!countriesMap.has(user.country)) {
          countriesMap.set(user.country, []);
        }
        countriesMap.get(user.country)!.push(user);
      }
    });

    // Update snapshots with country ranks
    countriesMap.forEach((countryUsers, country) => {
      const sortedCountryUsers = countryUsers.sort((a, b) => {
        if (b.total_xp !== a.total_xp) return b.total_xp - a.total_xp;
        if (b.xp_7d !== a.xp_7d) return b.xp_7d - a.xp_7d;
        return 0;
      });

      sortedCountryUsers.forEach((user, index) => {
        const snapshot = snapshots.find((s) => s.user_id === user.user_id);
        if (snapshot) {
          const rank = index + 1;
          const percentile = ((sortedCountryUsers.length - rank) / sortedCountryUsers.length) * 100;
          snapshot.rank_country = rank;
          snapshot.percentile_country = Math.round(percentile * 100) / 100;
        }
      });
    });

    // Insert snapshots
    const { error: insertError } = await supabaseClient
      .from("leaderboard_snapshots")
      .upsert(snapshots, {
        onConflict: "user_id,captured_on,paper_code",
      });

    if (insertError) throw insertError;

    console.log(`Successfully created ${snapshots.length} snapshots`);

    // Run anti-abuse detection
    await detectAbusePatterns(supabaseClient, usersWithXP);

    return new Response(
      JSON.stringify({
        success: true,
        snapshots_created: snapshots.length,
        timestamp: now.toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in leaderboard-snapshot:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

async function detectAbusePatterns(supabaseClient: any, users: UserXPData[]) {
  console.log("Running anti-abuse detection...");

  const median7dXP = calculateMedian(users.map((u) => u.xp_7d));

  for (const user of users) {
    // Spike detector: if xp_7d > 4 * median and > 1000
    if (user.xp_7d > 4 * median7dXP && user.xp_7d > 1000) {
      // Check if already flagged
      const { data: existingFlag } = await supabaseClient
        .from("flags_anti_abuse")
        .select("id")
        .eq("user_id", user.user_id)
        .eq("resolved", false)
        .eq("reason", "xp_spike")
        .single();

      if (!existingFlag) {
        await supabaseClient.from("flags_anti_abuse").insert({
          user_id: user.user_id,
          reason: "xp_spike",
          details: {
            xp_7d: user.xp_7d,
            median_7d: median7dXP,
            multiplier: user.xp_7d / median7dXP,
          },
        });
        console.log(`Flagged user ${user.user_id} for XP spike`);
      }
    }
  }
}

function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}
