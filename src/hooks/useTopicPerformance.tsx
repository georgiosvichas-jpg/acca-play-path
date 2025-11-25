import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useTopicPerformance() {
  const { user } = useAuth();

  const trackPerformance = async (
    paperCode: string,
    unitCode: string | null,
    topicName: string,
    isCorrect: boolean
  ) => {
    if (!user || !topicName) return;

    try {
      // Check if record exists
      const { data: existing } = await supabase
        .from("topic_performance")
        .select("*")
        .eq("user_id", user.id)
        .eq("paper_code", paperCode)
        .eq("unit_code", unitCode || "")
        .eq("topic_name", topicName)
        .single();

      if (existing) {
        // Update existing record
        const newAttempted = existing.questions_attempted + 1;
        const newCorrect = existing.questions_correct + (isCorrect ? 1 : 0);

        await supabase
          .from("topic_performance")
          .update({
            questions_attempted: newAttempted,
            questions_correct: newCorrect,
            last_practiced_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        // Insert new record
        await supabase.from("topic_performance").insert({
          user_id: user.id,
          paper_code: paperCode,
          unit_code: unitCode || null,
          topic_name: topicName,
          questions_attempted: 1,
          questions_correct: isCorrect ? 1 : 0,
        });
      }
    } catch (error) {
      console.error("Error tracking topic performance:", error);
    }
  };

  const trackBatchPerformance = async (
    results: Array<{
      paperCode: string;
      unitCode: string | null;
      topicName: string;
      isCorrect: boolean;
    }>
  ) => {
    for (const result of results) {
      await trackPerformance(
        result.paperCode,
        result.unitCode,
        result.topicName,
        result.isCorrect
      );
    }
  };

  return {
    trackPerformance,
    trackBatchPerformance,
  };
}
