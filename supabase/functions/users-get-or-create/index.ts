import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get authenticated user if available
    const authHeader = req.headers.get("Authorization");
    let userId: string | null = null;
    
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id || null;
    }

    const { email, exam_paper, exam_date, weekly_study_hours } = await req.json();

    // Try to find existing user
    let profile = null;
    
    if (userId) {
      const { data } = await supabaseClient
        .from("user_profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();
      profile = data;
    } else if (email) {
      // Find by email in auth.users (for GPT integration)
      const { data: { users } } = await supabaseClient.auth.admin.listUsers();
      const matchedUser = users?.find(u => u.email === email);
      
      if (matchedUser) {
        const { data } = await supabaseClient
          .from("user_profiles")
          .select("*")
          .eq("user_id", matchedUser.id)
          .maybeSingle();
        profile = data;
        userId = matchedUser.id;
      }
    }

    // Create or update profile
    if (!profile && userId) {
      const { data: newProfile, error } = await supabaseClient
        .from("user_profiles")
        .insert({
          user_id: userId,
          selected_paper: exam_paper || null,
          exam_date: exam_date || null,
          weekly_study_hours: weekly_study_hours || 5,
          total_xp: 0,
          study_streak: 0,
        })
        .select()
        .single();

      if (error) throw error;
      profile = newProfile;
    } else if (profile && (exam_paper || exam_date || weekly_study_hours)) {
      // Update existing profile
      const updates: any = {};
      if (exam_paper) updates.selected_paper = exam_paper;
      if (exam_date) updates.exam_date = exam_date;
      if (weekly_study_hours) updates.weekly_study_hours = weekly_study_hours;

      const { data: updated } = await supabaseClient
        .from("user_profiles")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();
      
      profile = updated || profile;
    }

    return new Response(
      JSON.stringify({
        id: profile?.id,
        user_id: profile?.user_id,
        email: email,
        exam_paper: profile?.selected_paper,
        exam_date: profile?.exam_date,
        weekly_study_hours: profile?.weekly_study_hours,
        subscription_status: profile?.plan_type || "free",
        created_at: profile?.created_at,
        updated_at: profile?.updated_at,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in users-get-or-create:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});