import Link from "next/link";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Dashboard | Fitness Directory",
  description: "Your Fitness Directory account",
};

export default async function DashboardPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Get user role and business profile
  const { data: userData } = await supabase
    .from("users")
    .select("role, favorite_centers")
    .eq("id", user.id)
    .single();

  const isOwner = userData?.role === "owner" || userData?.role === "admin";
  const favoriteCount = userData?.favorite_centers?.length ?? 0;

  // Only fetch business data for owners
  let listingsCount = 0;
  let pendingCount = 0;
  let businessProfile = null;

  if (isOwner) {
    const { count: listings } = await supabase
      .from("fitness_centers")
      .select("*", { count: "exact", head: true })
      .eq("owner_id", user.id);
    listingsCount = listings ?? 0;

    const { count: pending } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("status", "pending");
    pendingCount = pending ?? 0;

    const { data: profile } = await supabase
      .from("business_profiles")
      .select("id, business_name")
      .eq("user_id", user.id)
      .single();
    businessProfile = profile;
  }

  const displayName =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header showSearch={false} />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">
              Welcome back, {displayName}
            </h1>
            <p className="mt-1 text-zinc-600">
              {isOwner
                ? "Manage your fitness center listings and business"
                : "Find and save your favorite fitness centers"}
            </p>
          </div>

          {/* OWNER DASHBOARD */}
          {isOwner ? (
            <>
              {/* Quick Stats for Owners */}
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-white p-6">
                  <p className="text-sm font-medium text-zinc-500">
                    Your Listings
                  </p>
                  <p className="mt-2 text-3xl font-bold text-zinc-900">
                    {listingsCount}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-6">
                  <p className="text-sm font-medium text-zinc-500">
                    Pending Submissions
                  </p>
                  <p className="mt-2 text-3xl font-bold text-zinc-900">
                    {pendingCount}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-6">
                  <p className="text-sm font-medium text-zinc-500">
                    Account Type
                  </p>
                  <p className="mt-2 text-lg font-semibold text-purple-600">
                    Business
                  </p>
                </div>
              </div>

              {/* Business Profile Section */}
              <div className="mb-8">
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                        <svg
                          className="h-6 w-6 text-purple-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                          />
                        </svg>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-purple-900">
                            {businessProfile ? businessProfile.business_name : "Business Profile"}
                          </h3>
                          <span className="rounded-full bg-purple-200 px-2 py-0.5 text-xs font-medium text-purple-700">
                            Business Account
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-purple-700">
                          {businessProfile
                            ? "Manage your business information and listings"
                            : "Set up your business profile to manage multiple gyms"}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/owner/business-profile"
                      className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                    >
                      {businessProfile ? "Manage" : "Set Up"}
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Actions for Owners */}
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-zinc-900">
                  Quick Actions
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Link
                    href="/submit"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100">
                      <svg className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">Add a Gym</p>
                      <p className="text-sm text-zinc-500">Submit a new fitness center listing</p>
                    </div>
                  </Link>

                  <Link
                    href="/owner"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100">
                      <svg className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">My Listings</p>
                      <p className="text-sm text-zinc-500">Manage your fitness center listings</p>
                    </div>
                  </Link>

                  <Link
                    href="/search"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100">
                      <svg className="h-6 w-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">Browse Gyms</p>
                      <p className="text-sm text-zinc-500">Explore fitness centers</p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-4 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-200">
                      <svg className="h-6 w-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-500">Upgrade to Premium</p>
                      <p className="text-sm text-zinc-400">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* REGULAR USER DASHBOARD */}
              {/* Quick Stats for Regular Users */}
              <div className="mb-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-white p-6">
                  <p className="text-sm font-medium text-zinc-500">
                    Saved Gyms
                  </p>
                  <p className="mt-2 text-3xl font-bold text-zinc-900">
                    {favoriteCount}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-6">
                  <p className="text-sm font-medium text-zinc-500">
                    Account Type
                  </p>
                  <p className="mt-2 text-lg font-semibold text-green-600">
                    Member
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-6">
                  <p className="text-sm font-medium text-zinc-500">
                    Account Status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-green-600">
                    Active
                  </p>
                </div>
              </div>

              {/* Quick Actions for Regular Users */}
              <div className="mb-8">
                <h2 className="mb-4 text-lg font-semibold text-zinc-900">
                  Quick Actions
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Link
                    href="/search"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                      <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">Find a Gym</p>
                      <p className="text-sm text-zinc-500">Search for fitness centers near you</p>
                    </div>
                  </Link>

                  <Link
                    href="/search?type=crossfit"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">CrossFit Boxes</p>
                      <p className="text-sm text-zinc-500">Find CrossFit gyms</p>
                    </div>
                  </Link>

                  <Link
                    href="/search?type=powerlifting"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">Powerlifting Gyms</p>
                      <p className="text-sm text-zinc-500">Find strength-focused gyms</p>
                    </div>
                  </Link>

                  <Link
                    href="/search?type=24hour"
                    className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-6 transition-colors hover:bg-zinc-50"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-zinc-900">24-Hour Gyms</p>
                      <p className="text-sm text-zinc-500">Gyms open around the clock</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Become a Business User */}
              <div className="mb-8">
                <div className="rounded-xl border border-purple-200 bg-purple-50 p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                        <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="font-semibold text-purple-900">Own a Gym?</h3>
                        <p className="mt-1 text-sm text-purple-700">
                          Create a business account to list your fitness center
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/signup/business"
                      className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Account Info */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-zinc-900">
              Account Information
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-zinc-500">Email</dt>
                <dd className="mt-1 text-zinc-900">{user.email}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-zinc-500">Member Since</dt>
                <dd className="mt-1 text-zinc-900">
                  {new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
