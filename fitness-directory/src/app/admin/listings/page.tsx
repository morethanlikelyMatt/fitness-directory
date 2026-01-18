import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ListingsTable } from "./listings-table";

export const metadata = {
  title: "Manage Listings | Admin",
  description: "Manage fitness center listings",
};

interface PageProps {
  searchParams: Promise<{
    status?: string;
    tier?: string;
    page?: string;
    search?: string;
  }>;
}

interface Listing {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  status: string;
  subscription_tier: string;
  gym_type: string;
  created_at: string;
  owner_id: string | null;
}

const ITEMS_PER_PAGE = 20;

async function getListings(
  status?: string,
  tier?: string,
  page: number = 1,
  search?: string
): Promise<{ listings: Listing[]; total: number }> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("fitness_centers")
    .select("id, name, slug, city, country, status, subscription_tier, gym_type, created_at, owner_id", {
      count: "exact",
    });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (tier && tier !== "all") {
    query = query.eq("subscription_tier", tier);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    listings: data || [],
    total: count || 0,
  };
}

export default async function AdminListingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status || "all";
  const tier = params.tier || "all";
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";

  const { listings, total } = await getListings(status, tier, page, search);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Listings
          </h1>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            {total} listings total
          </p>
        </div>
        <Link
          href="/admin/listings/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
        >
          Add Listing
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-4">
        <form className="flex-1">
          <input
            type="text"
            name="search"
            placeholder="Search by name..."
            defaultValue={search}
            className="w-full max-w-xs rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </form>
        <div className="flex gap-2">
          <select
            defaultValue={status}
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set("status", e.target.value);
              url.searchParams.delete("page");
              window.location.href = url.toString();
            }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="claimed">Claimed</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            defaultValue={tier}
            onChange={(e) => {
              const url = new URL(window.location.href);
              url.searchParams.set("tier", e.target.value);
              url.searchParams.delete("page");
              window.location.href = url.toString();
            }}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          >
            <option value="all">All Tiers</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        <ListingsTable listings={listings} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/listings?page=${page - 1}&status=${status}&tier=${tier}&search=${search}`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/listings?page=${page + 1}&status=${status}&tier=${tier}&search=${search}`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
