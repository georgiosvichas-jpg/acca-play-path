import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId query parameter is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user profile
    const { data: user, error } = await supabaseClient
      .from("sb_users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;

    const paper = user.exam_paper || "BT";
    const weeklyHours = user.weekly_study_hours || 5;

    // Simple rule-based plan
    const dayOfWeek = new Date().getDay();
    const units = ["BT01", "BT02", "BT03", "BT04", "BT05", "BT06", "BT07"];
    const todayUnit = units[dayOfWeek % units.length];

    const plan = {
      paper,
      tasks: [
        {
          unit_code: todayUnit,
          type: "mcq",
          difficulty: "medium",
          count: 10,
        },
      ],
    };

    console.log(`Generated study plan for user ${userId}: ${paper}, unit ${todayUnit}`);

    return new Response(JSON.stringify(plan), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in plans-today-tasks:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
