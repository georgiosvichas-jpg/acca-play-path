// Stripe configuration with 3-tier pricing
export const STRIPE_PRICES = {
  // Pro tier
  PRO_MONTHLY: "price_pro_monthly_999", // €9.99/month - REPLACE WITH ACTUAL PRICE ID
  PRO_ANNUAL: "price_pro_annual_6900", // €69/year - REPLACE WITH ACTUAL PRICE ID
  
  // Elite tier
  ELITE_MONTHLY: "price_elite_monthly_1499", // €14.99/month - REPLACE WITH ACTUAL PRICE ID
  ELITE_ANNUAL: "price_elite_annual_9900", // €99/year - REPLACE WITH ACTUAL PRICE ID
} as const;

export const STRIPE_PRODUCTS = {
  PRO: "prod_pro", // REPLACE WITH ACTUAL PRODUCT ID
  ELITE: "prod_elite", // REPLACE WITH ACTUAL PRODUCT ID
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
  },
} as const;
