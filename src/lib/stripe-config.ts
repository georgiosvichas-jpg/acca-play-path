// Stripe configuration with 3-tier pricing
export const STRIPE_PRICES = {
  // Pro tier - €12.99/month or €99/year
  PRO_MONTHLY: "price_1SVtI1C00m6oIeSrImAXqeTD",
  PRO_ANNUAL: "price_1SVtHbC00m6oIeSrdQfKcmZr",
  
  // Elite tier - €19.99/month or €159/year
  ELITE_MONTHLY: "price_1SVtHBC00m6oIeSrwlq3HlBB",
  ELITE_ANNUAL: "price_1SVtGfC00m6oIeSr87tL5cus",
} as const;

export type PlanType = "free" | "pro" | "elite";

export interface SubscriptionInfo {
  isSubscribed: boolean;
  planType: PlanType;
  subscriptionEnd: string | null;
  isLoading: boolean;
}

// Feature limits by tier
export const TIER_LIMITS = {
  free: {
    questionBankPercent: 10,
    dailyFlashcards: 10,
    mocksPerWeek: 1,
    aiChat: false,
    spacedRepetition: false,
    advancedAnalytics: false,
    heatmaps: false,
    studyPlanDays: 7,
    aiTutor: false,
    predictiveAnalytics: false,
  },
  pro: {
    questionBankPercent: 100,
    dailyFlashcards: Infinity,
    mocksPerWeek: 4,
    aiChat: true,
    spacedRepetition: true,
    advancedAnalytics: true,
    heatmaps: true,
    studyPlanDays: Infinity,
    aiTutor: false,
    predictiveAnalytics: false,
    advancedSpacedRepetition: false,
    passProbability: false,
  },
  elite: {
    questionBankPercent: 100,
    dailyFlashcards: Infinity,
    mocksPerWeek: Infinity,
    aiChat: true,
    spacedRepetition: true,
    advancedAnalytics: true,
    heatmaps: true,
    studyPlanDays: Infinity,
    aiTutor: true,
    predictiveAnalytics: true,
    benchmarking: true,
    examWeekMode: true,
    multiPaperDashboard: true,
    aiCopilot: true,
    advancedSpacedRepetition: true,
    passProbability: true,
  },
} as const;
