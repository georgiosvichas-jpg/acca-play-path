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

    const { userId, session_type, total_questions, correct_answers, raw_log, paper_code } = await req.json();

    if (!userId || !session_type) {
      return new Response(
        JSON.stringify({ error: "userId and session_type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's paper if not provided
    let paper = paper_code;
    if (!paper) {
      const { data: profile } = await supabaseClient
        .from("user_profiles")
        .select("selected_paper")
        .eq("user_id", userId)
        .single();
      paper = profile?.selected_paper || "BT";
    }

    // Create study session
    const { data: session, error } = await supabaseClient
      .from("study_sessions")
      .insert({
        user_id: userId,
        paper_code: paper,
        session_date: new Date().toISOString().split('T')[0],
        session_type,
        total_questions: total_questions || 0,
        correct_answers: correct_answers || 0,
        raw_log,
        completed: true,
        completed_at: new Date().toISOString(),
        xp_earned: correct_answers * 10 || 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Update daily questions count
    const { data: profile } = await supabaseClient
      .from("user_profiles")
      .select("daily_questions_used, last_question_reset_date")
      .eq("user_id", userId)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const resetDate = profile?.last_question_reset_date;
    
    let newCount = (profile?.daily_questions_used || 0) + (total_questions || 0);
    
    // Reset if it's a new day
    if (resetDate !== today) {
      newCount = total_questions || 0;
      await supabaseClient
        .from("user_profiles")
        .update({
          daily_questions_used: newCount,
          last_question_reset_date: today,
        })
        .eq("user_id", userId);
    } else {
      await supabaseClient
        .from("user_profiles")
        .update({ daily_questions_used: newCount })
        .eq("user_id", userId);
    }

    return new Response(
      JSON.stringify({ success: true, session }),
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