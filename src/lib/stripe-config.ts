// Stripe configuration with 3-tier pricing
export const STRIPE_PRICES = {
  // Pro tier - €9.99/month or €69/year
  PRO_MONTHLY: "price_1SVBw6C00m6oIeSrvbUSmQbK",
  PRO_ANNUAL: "price_1SVByEC00m6oIeSrPKNL8gal",
  
  // Elite tier - €14.99/month or €99/year
  ELITE_MONTHLY: "price_1SVC7YC00m6oIeSrdyMATzGJ",
  ELITE_ANNUAL: "price_1SVC4XC00m6oIeSryt2whiQ2",
} as const;

export const STRIPE_PRODUCTS = {
  PRO_MONTHLY: "prod_TS68zu6h4qaE7j",
  PRO_ANNUAL: "prod_TS6AfVuTENSF9j",
  ELITE_MONTHLY: "prod_TS6FrtFjCMj5IJ",
  ELITE_ANNUAL: "prod_TS6HMg03CT5CuM",
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
