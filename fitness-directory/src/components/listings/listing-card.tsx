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
        isPremium
          ? "border-amber-200"
          : "border-zinc-200",
        className
      )}
    >
      {/* Premium Badge */}
      {isPremium && (
        <div className="mb-2">
          <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
            Premium
          </span>
        </div>
      )}

      {/* Name & Type */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-zinc-900 group-hover:text-zinc-700:text-zinc-300">
          {name}
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
