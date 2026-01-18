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
          <h1 className="text-2xl font-bold text-zinc-900">
            Listings
          </h1>
          <p className="mt-1 text-zinc-600">
            {total} listings total
          </p>
        </div>
        <Link
          href="/admin/listings/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800:bg-zinc-100"
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
            className="w-full max-w-xs rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm focus:border-zinc-400 focus:outline-none"
          />
        </form>
        <div className="flex gap-4">
          <div className="flex rounded-lg border border-zinc-200 bg-white">
            {[
              { value: "all", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "verified", label: "Verified" },
              { value: "claimed", label: "Claimed" },
              { value: "suspended", label: "Suspended" },
            ].map((s, i, arr) => (
              <Link
                key={s.value}
                href={`/admin/listings?status=${s.value}&tier=${tier}&search=${search}`}
                className={`px-3 py-2 text-sm font-medium ${
                  status === s.value
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-50"
                } ${i === 0 ? "rounded-l-lg" : ""} ${i === arr.length - 1 ? "rounded-r-lg" : ""}`}
              >
                {s.label}
              </Link>
            ))}
          </div>
          <div className="flex rounded-lg border border-zinc-200 bg-white">
            {[
              { value: "all", label: "All Tiers" },
              { value: "free", label: "Free" },
              { value: "premium", label: "Premium" },
            ].map((t, i, arr) => (
              <Link
                key={t.value}
                href={`/admin/listings?status=${status}&tier=${t.value}&search=${search}`}
                className={`px-3 py-2 text-sm font-medium ${
                  tier === t.value
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-50"
                } ${i === 0 ? "rounded-l-lg" : ""} ${i === arr.length - 1 ? "rounded-r-lg" : ""}`}
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        <ListingsTable listings={listings} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-zinc-600">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/listings?page=${page - 1}&status=${status}&tier=${tier}&search=${search}`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50:bg-zinc-800"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/listings?page=${page + 1}&status=${status}&tier=${tier}&search=${search}`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50:bg-zinc-800"
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
