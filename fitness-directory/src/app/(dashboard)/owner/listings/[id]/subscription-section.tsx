"use client";

import { useState } from "react";

interface SubscriptionSectionProps {
  fitnessCenterId: string;
  subscriptionTier: "free" | "premium";
  subscription: {
    id: string;
    status: string;
    current_period_end: string;
  } | null;
}

export function SubscriptionSection({
  fitnessCenterId,
  subscriptionTier,
  subscription,
}: SubscriptionSectionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInterval, setSelectedInterval] = useState<"monthly" | "yearly">("monthly");

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fitnessCenterId,
          interval: selectedInterval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fitnessCenterId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to open billing portal");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const isPremium = subscriptionTier === "premium";
  const isActive = subscription?.status === "active";
  const isPastDue = subscription?.status === "past_due";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Subscription
      </h2>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {isPremium && isActive ? (
        <div className="mt-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Premium Active
            </span>
          </div>
          <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
            Your premium subscription is active. Next billing date:{" "}
            <span className="font-medium text-zinc-900 dark:text-white">
              {new Date(subscription.current_period_end).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </p>
          <button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="mt-4 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {isLoading ? "Loading..." : "Manage Subscription"}
          </button>
        </div>
      ) : isPastDue ? (
        <div className="mt-4">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-medium text-red-700 dark:text-red-300">
                Payment Past Due
              </span>
            </div>
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              Your subscription payment has failed. Please update your payment method to maintain premium features.
            </p>
          </div>
          <button
            onClick={handleManageSubscription}
            disabled={isLoading}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Update Payment Method"}
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Upgrade to Premium to unlock enhanced features for your listing:
          </p>
          <ul className="mt-4 space-y-2">
            {[
              "Priority placement in search results",
              "Display equipment quantities",
              "Add photos and virtual tours",
              "Show class schedules",
              "Display contract terms and policies",
              "Staff bios and certifications",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <svg
                  className="h-4 w-4 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          {/* Pricing toggle */}
          <div className="mt-6">
            <div className="inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-700">
              <button
                onClick={() => setSelectedInterval("monthly")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  selectedInterval === "monthly"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedInterval("yearly")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  selectedInterval === "yearly"
                    ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                Yearly
                <span className="ml-1 text-xs text-green-600 dark:text-green-400">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          <button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="mt-6 w-full rounded-lg bg-amber-500 px-6 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isLoading ? "Loading..." : "Upgrade to Premium"}
          </button>
        </div>
      )}
    </div>
  );
}
