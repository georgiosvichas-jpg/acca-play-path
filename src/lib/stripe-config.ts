// Stripe configuration with price and product IDs
export const STRIPE_PRICES = {
  PER_PAPER: "price_1SPkKQC3L0h223NuMddrBtDn", // €9 one-time payment
  PRO_MONTHLY: "price_1SPkKpC3L0h223NunPhQLBAk", // €19/month
  PRO_ANNUAL: "price_1SPkLHC3L0h223NuHhJaYMh8", // €180/year (save 20%)
} as const;

export const STRIPE_PRODUCTS = {
  PER_PAPER: "prod_TMTGdkcbzuN0Vs",
  PRO_MONTHLY: "prod_TMTH1XO11Qbymt",
  PRO_ANNUAL: "prod_TMTHQA1ZP9vXRz",
} as const;

export type PlanType = "free" | "per_paper" | "pro";

export interface SubscriptionInfo {
  isSubscribed: boolean;
  planType: PlanType;
  unlockedPapers: string[];
  subscriptionEnd: string | null;
  isLoading: boolean;
}
