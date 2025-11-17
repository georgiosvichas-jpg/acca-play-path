import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useUserProfile } from "./useUserProfile";
import { toast } from "sonner";

export function useBadgeChecker() {
  const { user } = useAuth();
  const { profile } = useUserProfile();

  const checkAndAwardBadges = useCallback(async () => {
    if (!user || !profile) return;

    try {
      // Fetch all badges
      const { data: badges } = await supabase
        .from("badges")
        .select("*");

      if (!badges) return;

      // Fetch user's earned badges
      const { data: userBadges } = await supabase
        .from("user_badges")
        .select("badge_id")
        .eq("user_id", user.id);

      const earnedBadgeIds = userBadges?.map((ub) => ub.badge_id) || [];

      // Fetch user's study sessions for accuracy calculations
      const { data: sessions } = await supabase
        .from("sb_study_sessions")
        .select("*")
        .eq("user_id", user.id);

      // Calculate statistics
      let totalCorrect = 0;
      const unitStats: Record<string, { correct: number; total: number }> = {};

      sessions?.forEach((session) => {
        totalCorrect += session.correct_answers || 0;

        // Parse raw_log for unit accuracy
        if (session.raw_log && Array.isArray(session.raw_log)) {
          session.raw_log.forEach((log: any) => {
            const unit = log.unit || "unknown";
            if (!unitStats[unit]) {
              unitStats[unit] = { correct: 0, total: 0 };
            }
            unitStats[unit].total++;
            if (log.user_answer === log.correct_answer) {
              unitStats[unit].correct++;
            }
          });
        }
      });

      // Check each badge
      for (const badge of badges) {
        if (earnedBadgeIds.includes(badge.id)) continue;

        let shouldAward = false;

        switch (badge.criteria_type) {
          case "streak":
            if ((profile.study_streak || 0) >= badge.criteria_value) {
              shouldAward = true;
            }
            break;

          case "questions_correct":
            if (totalCorrect >= badge.criteria_value) {
              shouldAward = true;
            }
            break;

          case "unit_accuracy":
            // Check if any unit has >= criteria_value % accuracy
            for (const unit in unitStats) {
              const accuracy = (unitStats[unit].correct / unitStats[unit].total) * 100;
              if (accuracy >= badge.criteria_value && unitStats[unit].total >= 10) {
                shouldAward = true;
                break;
              }
            }
            break;

          case "perfect_quiz":
            // Check if any session has 100% accuracy
            const perfectSession = sessions?.find(
              (s) => s.total_questions > 0 && s.correct_answers === s.total_questions
            );
            if (perfectSession) {
              shouldAward = true;
            }
            break;
        }

        if (shouldAward) {
          await supabase
            .from("user_badges")
            .insert({ user_id: user.id, badge_id: badge.id });

          toast.success(`🏆 Badge Unlocked: ${badge.badge_name}`, {
            description: badge.description,
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Error checking badges:", error);
    }
  }, [user, profile]);

  useEffect(() => {
    checkAndAwardBadges();
  }, [checkAndAwardBadges]);

  return { checkAndAwardBadges };
}
