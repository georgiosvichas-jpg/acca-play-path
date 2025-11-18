// Stripe configuration with 3-tier pricing
export const STRIPE_PRICES = {
  // Pro tier - EXISTING PRODUCTS (need to create new ones at correct prices)
  PRO_MONTHLY: "price_1SPkKpC3L0h223NunPhQLBAk", // Current: €19/month - CREATE NEW at €9.99/month
  PRO_ANNUAL: "price_1SPkLHC3L0h223NuHhJaYMh8", // Current: €180/year - CREATE NEW at €69/year
  
  // Elite tier - CREATE THESE IN STRIPE DASHBOARD
  ELITE_MONTHLY: "price_elite_monthly_placeholder", // €14.99/month - CREATE IN STRIPE
  ELITE_ANNUAL: "price_elite_annual_placeholder", // €99/year - CREATE IN STRIPE
} as const;

export const STRIPE_PRODUCTS = {
  PRO_MONTHLY: "prod_TMTH1XO11Qbymt",
  PRO_ANNUAL: "prod_TMTHQA1ZP9vXRz",
  ELITE_MONTHLY: "prod_elite_monthly_placeholder", // CREATE IN STRIPE
  ELITE_ANNUAL: "prod_elite_annual_placeholder", // CREATE IN STRIPE
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
