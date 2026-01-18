import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { SubscriptionSection } from "./subscription-section";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ subscription?: string }>;
}

export default async function ListingDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { subscription: subscriptionStatus } = await searchParams;
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Get listing with subscription
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: listing, error: listingError } = await (supabase as any)
    .from("fitness_centers")
    .select(`
      *,
      subscriptions (
        id,
        status,
        current_period_end
      )
    `)
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (listingError || !listing) {
    notFound();
  }

  const subscription = listing.subscriptions?.[0] || null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header showSearch={false} />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Back link */}
          <div className="mb-6">
            <Link
              href="/owner"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              &larr; Back to listings
            </Link>
          </div>

          {/* Success/Cancel messages */}
          {subscriptionStatus === "success" && (
            <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium text-green-700 dark:text-green-300">
                  Premium subscription activated successfully!
                </span>
              </div>
            </div>
          )}

          {subscriptionStatus === "canceled" && (
            <div className="mb-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
              <span className="text-zinc-600 dark:text-zinc-400">
                Subscription checkout was canceled. You can try again anytime.
              </span>
            </div>
          )}

          {/* Header */}
          <div className="mb-8 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {listing.name}
                </h1>
                {listing.subscription_tier === "premium" && (
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Premium
                  </span>
                )}
              </div>
              <p className="mt-1 text-zinc-600 dark:text-zinc-400">
                {listing.city}, {listing.country}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/gym/${listing.slug}`}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                View Public Page
              </Link>
              <Link
                href={`/owner/listings/${id}/edit`}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Edit Listing
              </Link>
            </div>
          </div>

          {/* Listing Stats */}
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Status</p>
              <p className="mt-1 font-semibold capitalize text-zinc-900 dark:text-white">
                {listing.status}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Type</p>
              <p className="mt-1 font-semibold capitalize text-zinc-900 dark:text-white">
                {listing.gym_type.replace("_", " ")}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Added</p>
              <p className="mt-1 font-semibold text-zinc-900 dark:text-white">
                {new Date(listing.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Subscription Section */}
          <SubscriptionSection
            fitnessCenterId={id}
            subscriptionTier={listing.subscription_tier}
            subscription={subscription}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
