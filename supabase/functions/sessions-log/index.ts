import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schemas
const SESSION_TYPES = ["flashcard", "mcq", "mock_exam", "drill"];

function validateSessionType(type: string): boolean {
  return SESSION_TYPES.includes(type);
}

function validateNumber(value: any, min = 0, max = 10000): number {
  const num = parseInt(value);
  if (isNaN(num) || num < min || num > max) {
    throw new Error(`Invalid number: must be between ${min} and ${max}`);
  }
  return num;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authenticated user from JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = user.id;

    const { session_type, total_questions, correct_answers, raw_log, paper_code } = await req.json();

    // Validate inputs
    if (!session_type || !validateSessionType(session_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid session_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const validatedTotalQuestions = validateNumber(total_questions || 0, 0, 500);
    const validatedCorrectAnswers = validateNumber(correct_answers || 0, 0, validatedTotalQuestions);

    // Validate raw_log structure
    if (raw_log && !Array.isArray(raw_log)) {
      return new Response(
        JSON.stringify({ error: "raw_log must be an array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role key for database operations
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user's paper if not provided
    let paper = paper_code;
    if (!paper) {
      const { data: profile } = await supabaseAdmin
        .from("user_profiles")
        .select("selected_paper")
        .eq("user_id", userId)
        .single();
      paper = profile?.selected_paper || "BT";
    }

    // Create study session
    const { data: session, error } = await supabaseAdmin
      .from("study_sessions")
      .insert({
        user_id: userId,
        paper_code: paper,
        session_date: new Date().toISOString().split('T')[0],
        session_type,
        total_questions: validatedTotalQuestions,
        correct_answers: validatedCorrectAnswers,
        raw_log,
        completed: true,
        completed_at: new Date().toISOString(),
        xp_earned: validatedCorrectAnswers * 10,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating session:", error);
      throw error;
    }

    // Update daily questions count
    const { data: profile } = await supabaseAdmin
      .from("user_profiles")
      .select("daily_questions_used, last_question_reset_date")
      .eq("user_id", userId)
      .single();

    const today = new Date().toISOString().split('T')[0];
    const resetDate = profile?.last_question_reset_date;
    
    let newCount = (profile?.daily_questions_used || 0) + validatedTotalQuestions;
    
    // Reset if it's a new day
    if (resetDate !== today) {
      newCount = validatedTotalQuestions;
      await supabaseAdmin
        .from("user_profiles")
        .update({
          daily_questions_used: newCount,
          last_question_reset_date: today,
        })
        .eq("user_id", userId);
    } else {
      await supabaseAdmin
        .from("user_profiles")
        .update({ daily_questions_used: newCount })
        .eq("user_id", userId);
    }

    console.log(`Session logged for user ${userId}: ${session_type}, ${validatedCorrectAnswers}/${validatedTotalQuestions} correct`);

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
