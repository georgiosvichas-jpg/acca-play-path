// Stripe configuration with price and product IDs
export const STRIPE_PRICES = {
  PER_PAPER: "price_1QXF0xRuaGiYnFeCMqSKqK7E", // €9 one-time payment
  PRO_MONTHLY: "price_1QXF2VRuaGiYnFeCHoOLMSFz", // €19/month
  PRO_ANNUAL: "price_1QXF2VRuaGiYnFeCP0QKcOwZ", // €180/year (save 20%)
} as const;

export const STRIPE_PRODUCTS = {
  PER_PAPER: "prod_RdV9eJ5dxmXHhB",
  PRO: "prod_RdVAHKkQ5cGZcq",
} as const;

export type PlanType = "free" | "per_paper" | "pro";

export interface SubscriptionInfo {
  isSubscribed: boolean;
  planType: PlanType;
  unlockedPapers: string[];
  subscriptionEnd: string | null;
  isLoading: boolean;
}
