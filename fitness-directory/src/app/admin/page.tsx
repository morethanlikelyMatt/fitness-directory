import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Admin Dashboard | Fitness Directory",
  description: "Admin overview and statistics",
};

interface Stats {
  totalListings: number;
  pendingSubmissions: number;
  totalUsers: number;
  premiumListings: number;
}

async function getStats(): Promise<Stats> {
  const supabase = await createClient();

  // Get counts in parallel
  const [listingsResult, submissionsResult, usersResult, premiumResult] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("fitness_centers").select("id", { count: "exact", head: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("users").select("id", { count: "exact", head: true }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any).from("fitness_centers").select("id", { count: "exact", head: true }).eq("subscription_tier", "premium"),
  ]);

  return {
    totalListings: listingsResult.count || 0,
    pendingSubmissions: submissionsResult.count || 0,
    totalUsers: usersResult.count || 0,
    premiumListings: premiumResult.count || 0,
  };
}

interface RecentSubmission {
  id: string;
  type: string;
  status: string;
  submitted_at: string;
  users: { email: string } | null;
}

async function getRecentSubmissions(): Promise<RecentSubmission[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("submissions")
    .select("id, type, status, submitted_at, users(email)")
    .order("submitted_at", { ascending: false })
    .limit(5);

  return data || [];
}

interface RecentListing {
  id: string;
  name: string;
  city: string;
  status: string;
  created_at: string;
}

async function getRecentListings(): Promise<RecentListing[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("fitness_centers")
    .select("id, name, city, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return data || [];
}

export default async function AdminDashboard() {
  const [stats, recentSubmissions, recentListings] = await Promise.all([
    getStats(),
    getRecentSubmissions(),
    getRecentListings(),
  ]);

  const statCards = [
    {
      label: "Total Listings",
      value: stats.totalListings,
      href: "/admin/listings",
      color: "bg-blue-500",
    },
    {
      label: "Pending Submissions",
      value: stats.pendingSubmissions,
      href: "/admin/submissions",
      color: "bg-amber-500",
    },
    {
      label: "Total Users",
      value: stats.totalUsers,
      href: "/admin/users",
      color: "bg-green-500",
    },
    {
      label: "Premium Listings",
      value: stats.premiumListings,
      href: "/admin/listings?tier=premium",
      color: "bg-purple-500",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-900">
        Dashboard Overview
      </h1>
      <p className="mt-1 text-zinc-600">
        Platform statistics and recent activity
      </p>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className={`h-12 w-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                <span className="text-xl font-bold text-white">{stat.value}</span>
              </div>
              <div>
                <p className="text-sm text-zinc-500">{stat.label}</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Recent Submissions */}
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <h2 className="font-semibold text-zinc-900">
              Recent Submissions
            </h2>
            <Link
              href="/admin/submissions"
              className="text-sm text-zinc-600 hover:text-zinc-900:text-white"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="divide-y divide-zinc-200">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {submission.type === "new_submission" ? "New Gym" : "Claim Request"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {submission.users?.email || "Unknown user"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        submission.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : submission.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {submission.status}
                    </span>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(submission.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-sm text-zinc-500">
                No submissions yet
              </div>
            )}
          </div>
        </div>

        {/* Recent Listings */}
        <div className="rounded-xl border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4">
            <h2 className="font-semibold text-zinc-900">
              Recent Listings
            </h2>
            <Link
              href="/admin/listings"
              className="text-sm text-zinc-600 hover:text-zinc-900:text-white"
            >
              View all &rarr;
            </Link>
          </div>
          <div className="divide-y divide-zinc-200">
            {recentListings.length > 0 ? (
              recentListings.map((listing) => (
                <div key={listing.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {listing.name}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {listing.city}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        listing.status === "verified" || listing.status === "claimed"
                          ? "bg-green-100 text-green-700"
                          : listing.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-zinc-100 text-zinc-600"
                      }`}
                    >
                      {listing.status}
                    </span>
                    <p className="mt-1 text-xs text-zinc-500">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-sm text-zinc-500">
                No listings yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
