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

    // Get all sessions for the authenticated user
    const { data: sessions, error } = await supabaseClient
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("session_date", { ascending: false });

    if (error) throw error;

    // Calculate overall stats
    const totalQuestions = sessions?.reduce((sum, s) => sum + (s.total_questions || 0), 0) || 0;
    const totalCorrect = sessions?.reduce((sum, s) => sum + (s.correct_answers || 0), 0) || 0;
    const overallAccuracy = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    // Accuracy by unit (from raw_log)
    const unitStats: Record<string, { correct: number; total: number }> = {};
    const difficultyStats: Record<string, { correct: number; total: number }> = {};

    sessions?.forEach(session => {
      if (session.raw_log && Array.isArray(session.raw_log)) {
        session.raw_log.forEach((q: any) => {
          // Validate raw_log structure
          if (typeof q !== "object" || q === null) return;
          
          const unit = q.unit_code || "unknown";
          const difficulty = q.difficulty || "unknown";
          
          if (!unitStats[unit]) unitStats[unit] = { correct: 0, total: 0 };
          if (!difficultyStats[difficulty]) difficultyStats[difficulty] = { correct: 0, total: 0 };
          
          unitStats[unit].total++;
          difficultyStats[difficulty].total++;
          
          if (q.correct) {
            unitStats[unit].correct++;
            difficultyStats[difficulty].correct++;
          }
        });
      }
    });

    // Format accuracy by unit
    const accuracyByUnit = Object.entries(unitStats).map(([unit, stats]) => ({
      unit_code: unit,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      total: stats.total,
    }));

    // Format accuracy by difficulty
    const accuracyByDifficulty = Object.entries(difficultyStats).map(([difficulty, stats]) => ({
      difficulty,
      accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      total: stats.total,
    }));

    // Get last activity and exam date
    const { data: profile } = await supabaseClient
      .from("user_profiles")
      .select("exam_date")
      .eq("user_id", userId)
      .single();

    const lastActivity = sessions?.[0]?.session_date || null;

    console.log(`Analytics fetched for user ${userId}: ${totalQuestions} questions answered`);

    return new Response(
      JSON.stringify({
        questions_answered: totalQuestions,
        overall_accuracy: Math.round(overallAccuracy * 10) / 10,
        accuracy_by_unit: accuracyByUnit,
        accuracy_by_difficulty: accuracyByDifficulty,
        last_activity_date: lastActivity,
        exam_date: profile?.exam_date,
        total_sessions: sessions?.length || 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analytics-summary:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});