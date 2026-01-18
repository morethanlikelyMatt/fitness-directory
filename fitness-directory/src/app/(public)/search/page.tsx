import { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout";
import { Footer } from "@/components/layout";
import { SearchFilters, SearchFiltersSkeleton } from "@/components/search";
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
    <div className="flex min-h-screen flex-col bg-white dark:bg-zinc-950">
      <Header showSearch={false} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-8">
          {/* Search Header */}
          <div className="mb-8">
            <form action="/search" className="flex gap-2">
              <input
                type="text"
                name="q"
                defaultValue={params.q || ""}
                placeholder="Search gyms, equipment, or location..."
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-400"
              />
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Search
              </button>
            </form>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            {/* Filters Sidebar */}
            <aside className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <h2 className="mb-4 font-semibold text-zinc-900 dark:text-white">
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
    });
  } catch (e) {
    console.error("Search error:", e);
    error = "Search is currently unavailable. Please try again later.";
  }

  if (error) {
    return (
      <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
        <p className="text-zinc-500 dark:text-zinc-400">{error}</p>
      </div>
    );
  }

  if (!results || results.results.length === 0) {
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            0 results found {query && `for "${query}"`}
          </p>
        </div>
        <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
          <p className="text-zinc-500 dark:text-zinc-400">
            No fitness centers found. Try adjusting your search criteria.
          </p>
          <Link
            href="/submit"
            className="mt-4 inline-block text-sm font-medium text-zinc-900 hover:underline dark:text-white"
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
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
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
    type?: string;
    price?: string;
    attr?: string;
    "24hour"?: string;
    page?: string;
    sort?: string;
  };
}) {
  const query = params.q || "";

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
    });
    facets = results.facets;
  } catch (e) {
    console.error("Error fetching facets:", e);
  }

  return <SearchFilters facets={facets} />;
}

// Sort select component
function SortSelect({ currentSort }: { currentSort: string }) {
  return (
    <form>
      <select
        name="sort"
        defaultValue={currentSort}
        onChange={(e) => {
          const form = e.target.form;
          if (form) form.submit();
        }}
        className="rounded border border-zinc-300 bg-white px-3 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      >
        <option value="relevance">Sort by: Relevance</option>
        <option value="newest">Newest</option>
        <option value="name">Name (A-Z)</option>
      </select>
    </form>
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
          className="rounded px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Previous
        </Link>
      )}

      {startPage > 1 && (
        <>
          <Link
            href={createPageUrl(1)}
            className="rounded px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
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
              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
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
            className="rounded px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            {totalPages}
          </Link>
        </>
      )}

      {currentPage < totalPages && (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="rounded px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
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
        <div className="h-5 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="h-8 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <ListingCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
