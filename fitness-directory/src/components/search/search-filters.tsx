"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface FacetCount {
  value: string;
  count: number;
}

interface SearchFiltersProps {
  facets: {
    gymTypes: FacetCount[];
    priceRanges: FacetCount[];
    attributes: FacetCount[];
  };
}

const gymTypeLabels: Record<string, string> = {
  commercial: "Commercial Gym",
  boutique: "Boutique Studio",
  crossfit: "CrossFit Box",
  powerlifting: "Powerlifting Gym",
  "24hour": "24-Hour Gym",
  womens: "Women's Only",
  rehab: "Rehab/PT",
  university: "University Gym",
  hotel: "Hotel Gym",
  community: "Community Center",
};

export function SearchFilters({ facets }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedGymTypes = searchParams.get("type")?.split(",").filter(Boolean) || [];
  const selectedPriceRanges = searchParams.get("price")?.split(",").filter(Boolean) || [];
  const selectedAttributes = searchParams.get("attr")?.split(",").filter(Boolean) || [];
  const is24Hour = searchParams.get("24hour") === "true";

  const updateFilters = useCallback(
    (key: string, values: string[]) => {
      const params = new URLSearchParams(searchParams.toString());
      if (values.length > 0) {
        params.set(key, values.join(","));
      } else {
        params.delete(key);
      }
      // Reset to page 1 when filters change
      params.delete("page");
      router.push(`/search?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleFilter = useCallback(
    (key: string, value: string, currentValues: string[]) => {
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      updateFilters(key, newValues);
    },
    [updateFilters]
  );

  const toggle24Hour = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (is24Hour) {
      params.delete("24hour");
    } else {
      params.set("24hour", "true");
    }
    params.delete("page");
    router.push(`/search?${params.toString()}`);
  }, [router, searchParams, is24Hour]);

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams();
    const query = searchParams.get("q");
    if (query) params.set("q", query);
    router.push(`/search?${params.toString()}`);
  }, [router, searchParams]);

  const hasActiveFilters =
    selectedGymTypes.length > 0 ||
    selectedPriceRanges.length > 0 ||
    selectedAttributes.length > 0 ||
    is24Hour;

  return (
    <div className="space-y-6">
      {/* Clear Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          Clear all filters
        </button>
      )}

      {/* 24-Hour Filter */}
      <div>
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={is24Hour}
            onChange={toggle24Hour}
            className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Open 24 hours
          </span>
        </label>
      </div>

      {/* Gym Type Filter */}
      {facets.gymTypes.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
            Gym Type
          </h3>
          <div className="space-y-2">
            {facets.gymTypes.map(({ value, count }) => (
              <label key={value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedGymTypes.includes(value)}
                  onChange={() => toggleFilter("type", value, selectedGymTypes)}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
                />
                <span className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {gymTypeLabels[value] || value}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Price Range Filter */}
      {facets.priceRanges.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
            Price Range
          </h3>
          <div className="space-y-2">
            {facets.priceRanges.map(({ value, count }) => (
              <label key={value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedPriceRanges.includes(value)}
                  onChange={() => toggleFilter("price", value, selectedPriceRanges)}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
                />
                <span className="flex-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {value}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Equipment & Amenities Filter */}
      {facets.attributes.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-white">
            Equipment & Amenities
          </h3>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {facets.attributes.slice(0, 20).map(({ value, count }) => (
              <label key={value} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedAttributes.includes(value)}
                  onChange={() => toggleFilter("attr", value, selectedAttributes)}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500 dark:border-zinc-600 dark:bg-zinc-800"
                />
                <span className="flex-1 truncate text-sm text-zinc-600 dark:text-zinc-400">
                  {value}
                </span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {count}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function SearchFiltersSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-4 flex-1 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-3 h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
              <div className="h-4 flex-1 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
