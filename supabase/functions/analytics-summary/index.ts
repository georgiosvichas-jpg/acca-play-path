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

    // Get all sessions for the user
    const { data: sessions, error } = await supabaseClient
      .from("sb_study_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Calculate overall stats
    const totalQuestions = sessions?.reduce((sum, s) => sum + (s.total_questions || 0), 0) || 0;
    const totalCorrect = sessions?.reduce((sum, s) => sum + (s.correct_answers || 0), 0) || 0;
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Accuracy by unit (from raw_log)
    const unitStats: Record<string, { correct: number; total: number }> = {};
    const difficultyStats: Record<string, { correct: number; total: number }> = {};

    sessions?.forEach(session => {
      if (session.raw_log && Array.isArray(session.raw_log)) {
        session.raw_log.forEach((q: any) => {
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
    const byUnit: Record<string, number> = {};
    Object.entries(unitStats).forEach(([unit, stats]) => {
      byUnit[unit] = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    });

    // Format accuracy by difficulty
    const byDifficulty: Record<string, number> = {};
    Object.entries(difficultyStats).forEach(([difficulty, stats]) => {
      byDifficulty[difficulty] = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    });

    const summary = {
      total_questions: totalQuestions,
      overall_accuracy: overallAccuracy,
      by_unit: byUnit,
      by_difficulty: byDifficulty,
    };

    console.log(`Analytics generated for user ${userId}: ${totalQuestions} questions answered`);

    return new Response(
      JSON.stringify(summary),
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
