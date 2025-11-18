import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

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

    const { userId, session_type, total_questions, correct_answers, raw_log } = await req.json();

    if (!userId || !session_type) {
      return new Response(
        JSON.stringify({ error: "userId and session_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate session_type
    const validTypes = ["onboarding", "daily", "quick_drill", "mini_test", "mock_exam"];
    if (!validTypes.includes(session_type)) {
      return new Response(
        JSON.stringify({ error: `session_type must be one of: ${validTypes.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create session log
    const { data: session, error } = await supabaseClient
      .from("sb_study_sessions")
      .insert({
        user_id: userId,
        session_type,
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
        total_questions: total_questions || 0,
        correct_answers: correct_answers || 0,
        raw_log: raw_log || null,
      })
      .select()
      .single();

    if (error) throw error;

    console.log(`Logged session for user ${userId}: ${session_type}, ${correct_answers}/${total_questions} correct`);

    return new Response(
      JSON.stringify(session),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in sessions-log:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
