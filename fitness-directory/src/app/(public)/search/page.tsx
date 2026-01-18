import { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout";
import { Footer } from "@/components/layout";
import { SearchFilters, SearchFiltersSkeleton, LocationAutocomplete } from "@/components/search";
import { ListingCard, ListingCardSkeleton } from "@/components/listings";
import { searchFitnessCenters } from "@/lib/typesense";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Search Gyms",
  description: "Search for fitness centers by location, equipment, and amenities.",
};

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    location?: string;
    type?: string;
    price?: string;
    attr?: string;
    "24hour"?: string;
    page?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col bg-[#FFFBF7]">
      <Header showSearch={false} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <form action="/search" className="flex flex-col gap-3 sm:flex-row sm:gap-2">
              <div className="flex-1">
                <label className="mb-1 block text-xs font-medium text-stone-500 uppercase tracking-wide">
                  Find
                </label>
                <input
                  type="text"
                  name="q"
                  defaultValue={params.q || ""}
                  placeholder="sauna, crossfit, yoga..."
                  className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-stone-900 placeholder-stone-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>
              <div className="sm:w-56">
                <label className="mb-1 block text-xs font-medium text-stone-500 uppercase tracking-wide">
                  Near
                </label>
                <LocationAutocomplete
                  name="location"
                  defaultValue={params.location || ""}
                  placeholder="City or ZIP"
                />
              </div>
              <div className="sm:self-end">
                <button
                  type="submit"
                  className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 font-semibold text-white hover:from-orange-600 hover:to-amber-600 transition-all"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl border border-stone-200 bg-white p-5">
                <h2 className="mb-4 font-semibold text-stone-900">
                  Filters
                </h2>
                <Suspense fallback={<SearchFiltersSkeleton />}>
                  <SearchResultsFilters params={params} />
                </Suspense>
              </div>
            </aside>

            {/* Results */}
            <div className="lg:col-span-3">
              <Suspense fallback={<SearchResultsSkeleton />}>
                <SearchResults params={params} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Server component for search results
async function SearchResults({
  params,
}: {
  params: {
    q?: string;
    location?: string;
    type?: string;
    price?: string;
    attr?: string;
    "24hour"?: string;
    page?: string;
    sort?: string;
  };
}) {
  const query = params.q || "";
  const page = parseInt(params.page || "1", 10);
  const sortBy = (params.sort as "relevance" | "distance" | "newest" | "name") || "relevance";

  // Parse location - extract city name from "City, ST" format
  const locationCity = params.location?.split(",")[0]?.trim();

  // Parse filters
  const gymTypes = params.type?.split(",").filter(Boolean);
  const priceRanges = params.price?.split(",").filter(Boolean);
  const attributes = params.attr?.split(",").filter(Boolean);
  const is24Hour = params["24hour"] === "true" ? true : undefined;

  let results;
  let error = null;

  try {
    results = await searchFitnessCenters({
      query,
      page,
      perPage: 12,
      gymTypes,
      priceRanges,
      attributes,
      is24Hour,
      sortBy,
      cities: locationCity ? [locationCity] : undefined,
    });
  } catch (e) {
    console.error("Search error:", e);
    error = "Search is currently unavailable. Please try again later.";
  }

  if (error) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
        <p className="text-zinc-500">{error}</p>
      </div>
    );
  }

  if (!results || results.results.length === 0) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-600">
            0 results found {query && `for "${query}"`}
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center">
          <p className="text-zinc-500">
            No fitness centers found. Try adjusting your search criteria.
          </p>
          <Link
            href="/submit"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 hover:underline"
          >
            Don&apos;t see your gym? Add it →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Results Header */}
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-zinc-600">
          {results.total.toLocaleString()} results found
          {query && ` for "${query}"`}
          {results.processingTimeMs > 0 && (
            <span className="ml-1 text-zinc-400">
              ({results.processingTimeMs}ms)
            </span>
          )}
        </p>
        <SortSelect currentSort={sortBy} />
      </div>

      {/* Results Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {results.results.map((result) => (
          <ListingCard
            key={result.id}
            id={result.id}
            name={result.name}
            slug={result.slug}
            address={result.address}
            city={result.city}
            state={result.state}
            country={result.country}
            gymType={result.gym_type}
            priceRange={result.price_range}
            subscriptionTier={result.subscription_tier}
            attributes={result.attributes}
            distance={result.distance}
          />
        ))}
      </div>

      {/* Pagination */}
      {results.totalPages > 1 && (
        <Pagination
          currentPage={results.page}
          totalPages={results.totalPages}
          params={params}
        />
      )}
    </div>
  );
}

// Server component for filters with facets
async function SearchResultsFilters({
  params,
}: {
  params: {
    q?: string;
    location?: string;
    type?: string;
    price?: string;
    attr?: string;
    "24hour"?: string;
    page?: string;
    sort?: string;
  };
}) {
  const query = params.q || "";

  // Parse location - extract city name from "City, ST" format
  const locationCity = params.location?.split(",")[0]?.trim();

  // Parse filters
  const gymTypes = params.type?.split(",").filter(Boolean);
  const priceRanges = params.price?.split(",").filter(Boolean);
  const attributes = params.attr?.split(",").filter(Boolean);
  const is24Hour = params["24hour"] === "true" ? true : undefined;

  let facets: {
    gymTypes: { value: string; count: number }[];
    priceRanges: { value: string; count: number }[];
    attributes: { value: string; count: number }[];
    cities: { value: string; count: number }[];
    countries: { value: string; count: number }[];
  } = {
    gymTypes: [],
    priceRanges: [],
    attributes: [],
    cities: [],
    countries: [],
  };

  try {
    const results = await searchFitnessCenters({
      query,
      page: 1,
      perPage: 1,
      gymTypes,
      priceRanges,
      attributes,
      is24Hour,
      cities: locationCity ? [locationCity] : undefined,
    });
    facets = results.facets;
  } catch (e) {
    console.error("Error fetching facets:", e);
  }

  return <SearchFilters facets={facets} />;
}

// Sort select component - uses links instead of onChange for server component compatibility
function SortSelect({ currentSort }: { currentSort: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-stone-500">Sort:</span>
      <Link
        href="?sort=relevance"
        className={`px-2 py-1 rounded ${currentSort === "relevance" ? "bg-orange-100 text-orange-700 font-medium" : "text-stone-600 hover:bg-stone-100"}`}
      >
        Relevance
      </Link>
      <Link
        href="?sort=newest"
        className={`px-2 py-1 rounded ${currentSort === "newest" ? "bg-orange-100 text-orange-700 font-medium" : "text-stone-600 hover:bg-stone-100"}`}
      >
        Newest
      </Link>
      <Link
        href="?sort=name"
        className={`px-2 py-1 rounded ${currentSort === "name" ? "bg-orange-100 text-orange-700 font-medium" : "text-stone-600 hover:bg-stone-100"}`}
      >
        A-Z
      </Link>
    </div>
  );
}

// Pagination component
function Pagination({
  currentPage,
  totalPages,
  params,
}: {
  currentPage: number;
  totalPages: number;
  params: Record<string, string | undefined>;
}) {
  const createPageUrl = (page: number) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value && key !== "page") {
        searchParams.set(key, value);
      }
    });
    searchParams.set("page", page.toString());
    return `/search?${searchParams.toString()}`;
  };

  const pages = [];
  const showPages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(showPages / 2));
  const endPage = Math.min(totalPages, startPage + showPages - 1);
  startPage = Math.max(1, endPage - showPages + 1);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-1">
      {currentPage > 1 && (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="rounded px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100:bg-zinc-800"
        >
          Previous
        </Link>
      )}

      {startPage > 1 && (
        <>
          <Link
            href={createPageUrl(1)}
            className="rounded px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100:bg-zinc-800"
          >
            1
          </Link>
          {startPage > 2 && (
            <span className="px-2 text-zinc-400">...</span>
          )}
        </>
      )}

      {pages.map((page) => (
        <Link
          key={page}
          href={createPageUrl(page)}
          className={`rounded px-3 py-2 text-sm ${
            page === currentPage
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-100:bg-zinc-800"
          }`}
        >
          {page}
        </Link>
      ))}

      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <span className="px-2 text-zinc-400">...</span>
          )}
          <Link
            href={createPageUrl(totalPages)}
            className="rounded px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100:bg-zinc-800"
          >
            {totalPages}
          </Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="rounded px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100:bg-zinc-800"
        >
          Next
        </Link>
      )}
    </nav>
  );
}

// Loading skeleton
function SearchResultsSkeleton() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
