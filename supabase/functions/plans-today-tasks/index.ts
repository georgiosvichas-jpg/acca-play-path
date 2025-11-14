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
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile to determine paper
    const { data: profile } = await supabaseClient
      .from("user_profiles")
      .select("selected_paper, weekly_study_hours")
      .eq("user_id", userId)
      .single();

    const paper = profile?.selected_paper || "BT";
    const weeklyHours = profile?.weekly_study_hours || 5;
    const dailyQuestions = Math.floor((weeklyHours * 60) / 7 / 3); // Rough estimate: 3 min per question

    // Simple rule-based plan: rotate through units
    const dayOfWeek = new Date().getDay();
    const units = ["BT01", "BT02", "BT03", "BT04", "BT05", "BT06"];
    const todayUnit = units[dayOfWeek % units.length];

    const plan = {
      paper,
      tasks: [
        {
          unit_code: todayUnit,
          type: "mcq",
          count: Math.floor(dailyQuestions * 0.7),
        },
        {
          unit_code: todayUnit,
          type: "flashcard",
          count: Math.floor(dailyQuestions * 0.3),
        },
      ],
    };

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