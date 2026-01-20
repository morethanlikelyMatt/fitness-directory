"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  gymType: string;
  priceRange?: string;
  subscriptionTier: string;
  attributes?: string[];
  distance?: number;
  className?: string;
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

export function ListingCard({
  name,
  slug,
  address,
  city,
  state,
  country,
  gymType,
  priceRange,
  subscriptionTier,
  attributes = [],
  distance,
  className,
}: ListingCardProps) {
  const isPremium = subscriptionTier === "premium";
  const locationParts = [city, state, country].filter(Boolean);

  return (
    <Link
      href={`/gym/${slug}`}
      className={cn(
        "group block rounded-lg border bg-white p-4 transition-all hover:shadow-md",
        "border-zinc-200",
        className
      )}
    >
      {/* Name & Type */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-zinc-900 group-hover:text-zinc-700 flex items-center gap-1.5">
          {name}
          {/* Subtle verified indicator for premium listings */}
          {isPremium && (
            <svg
              className="h-4 w-4 text-blue-500 shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-label="Verified listing"
            >
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )}
        </h3>
        {priceRange && (
          <span className="shrink-0 text-sm text-zinc-500">
            {priceRange}
          </span>
        )}
      </div>

      {/* Gym Type */}
      <p className="mt-1 text-sm text-zinc-600">
        {gymTypeLabels[gymType] || gymType}
      </p>

      {/* Location */}
      <p className="mt-2 text-sm text-zinc-500">
        {address}
        <br />
        {locationParts.join(", ")}
      </p>

      {/* Distance (if available) */}
      {distance !== undefined && (
        <p className="mt-2 text-sm font-medium text-zinc-700">
          {distance < 1
            ? `${(distance * 5280).toFixed(0)} ft away`
            : `${distance.toFixed(1)} mi away`}
        </p>
      )}

      {/* Attributes Preview */}
      {attributes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {attributes.slice(0, 4).map((attr) => (
            <span
              key={attr}
              className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600"
            >
              {attr}
            </span>
          ))}
          {attributes.length > 4 && (
            <span className="rounded bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500">
              +{attributes.length - 4} more
            </span>
          )}
        </div>
      )}
    </Link>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4">
      <div className="h-5 w-3/4 animate-pulse rounded bg-zinc-200" />
      <div className="mt-2 h-4 w-1/3 animate-pulse rounded bg-zinc-200" />
      <div className="mt-3 h-4 w-full animate-pulse rounded bg-zinc-200" />
      <div className="mt-1 h-4 w-2/3 animate-pulse rounded bg-zinc-200" />
      <div className="mt-3 flex gap-1">
        <div className="h-5 w-16 animate-pulse rounded bg-zinc-200" />
        <div className="h-5 w-20 animate-pulse rounded bg-zinc-200" />
        <div className="h-5 w-14 animate-pulse rounded bg-zinc-200" />
      </div>
    </div>
  );
}
