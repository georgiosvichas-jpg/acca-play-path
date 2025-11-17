import { useMemo } from "react";
import { useSubscription } from "./useSubscription";
import { TIER_LIMITS, type PlanType } from "@/lib/stripe-config";

export function useFeatureAccess() {
  const { planType, isLoading } = useSubscription();

  const limits = useMemo(() => TIER_LIMITS[planType], [planType]);

  const hasFeature = (feature: keyof typeof TIER_LIMITS.elite) => {
    return limits[feature as keyof typeof limits] === true || limits[feature as keyof typeof limits] === Infinity;
  };

  const canAccessMockExam = (usedThisWeek: number) => {
    return usedThisWeek < limits.mocksPerWeek;
  };

  const canAccessFlashcards = (usedToday: number) => {
    return usedToday < limits.dailyFlashcards;
  };

  const getQuestionBankLimit = (totalQuestions: number) => {
    return Math.floor((totalQuestions * limits.questionBankPercent) / 100);
  };

  const canAccessStudyPlan = (daysFromNow: number) => {
    return daysFromNow <= limits.studyPlanDays;
  };

  const getUpgradeMessage = (feature: string): { tier: PlanType; message: string } => {
    // Check if Pro has this feature
    const proHasFeature = TIER_LIMITS.pro[feature as keyof typeof TIER_LIMITS.pro];
    if (proHasFeature === true || proHasFeature === Infinity) {
      return {
        tier: "pro",
        message: `Upgrade to Pro to access ${feature}`,
      };
    }
    
    // Otherwise, Elite is needed
    return {
      tier: "elite",
      message: `Upgrade to Elite to access ${feature}`,
    };
  };

  return {
    planType,
    limits,
    hasFeature,
    canAccessMockExam,
    canAccessFlashcards,
    getQuestionBankLimit,
    canAccessStudyPlan,
    getUpgradeMessage,
    isLoading,
  };
}
