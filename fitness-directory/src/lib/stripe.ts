import Stripe from "stripe";

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing STRIPE_SECRET_KEY environment variable");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
      typescript: true,
    });
  }
  return stripeInstance;
}

// For convenience, export a getter that can be used in non-build contexts
export const stripe = {
  get instance() {
    return getStripe();
  },
  get customers() {
    return getStripe().customers;
  },
  get subscriptions() {
    return getStripe().subscriptions;
  },
  get checkout() {
    return getStripe().checkout;
  },
  get billingPortal() {
    return getStripe().billingPortal;
  },
  get webhooks() {
    return getStripe().webhooks;
  },
};

// Price IDs from your Stripe Dashboard
// These should be configured in environment variables for production
export const STRIPE_PRICES = {
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || "price_premium_monthly",
  premium_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || "price_premium_yearly",
} as const;

export type PricingInterval = "monthly" | "yearly";

export function getPriceId(interval: PricingInterval): string {
  return interval === "yearly"
    ? STRIPE_PRICES.premium_yearly
    : STRIPE_PRICES.premium_monthly;
}
