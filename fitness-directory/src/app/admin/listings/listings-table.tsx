"use client";

import { useState } from "react";
import Link from "next/link";
import { updateListingStatus, deleteListing } from "./actions";

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

interface ListingsTableProps {
  listings: Listing[];
}

const gymTypeLabels: Record<string, string> = {
  commercial: "Commercial",
  boutique: "Boutique",
  crossfit: "CrossFit",
  powerlifting: "Powerlifting",
  "24hour": "24-Hour",
  womens: "Women's Only",
  rehab: "Rehab",
  university: "University",
  hotel: "Hotel",
  community: "Community",
};

export function ListingsTable({ listings }: ListingsTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingId(id);
    await updateListingStatus(id, newStatus);
    setLoadingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }
    setLoadingId(id);
    await deleteListing(id);
    setLoadingId(null);
  };

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-900">
        <p className="text-zinc-500 dark:text-zinc-400">No listings found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="w-full">
        <thead className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-800/50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Location
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Type
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Tier
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {listings.map((listing) => (
            <tr
              key={listing.id}
              className={loadingId === listing.id ? "opacity-50" : ""}
            >
              <td className="px-4 py-3">
                <div>
                  <Link
                    href={`/gym/${listing.slug}`}
                    className="font-medium text-zinc-900 hover:underline dark:text-white"
                  >
                    {listing.name}
                  </Link>
                  {listing.owner_id && (
                    <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                      Claimed
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  {new Date(listing.created_at).toLocaleDateString()}
                </p>
              </td>
              <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                {listing.city}, {listing.country}
              </td>
              <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400">
                {gymTypeLabels[listing.gym_type] || listing.gym_type}
              </td>
              <td className="px-4 py-3">
                <select
                  value={listing.status}
                  onChange={(e) => handleStatusChange(listing.id, e.target.value)}
                  disabled={loadingId === listing.id}
                  className={`rounded-md border px-2 py-1 text-xs font-medium ${
                    listing.status === "verified" || listing.status === "claimed"
                      ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : listing.status === "pending"
                        ? "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="claimed">Claimed</option>
                  <option value="suspended">Suspended</option>
                </select>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    listing.subscription_tier === "premium"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                      : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {listing.subscription_tier}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/admin/listings/${listing.id}/edit`}
                    className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(listing.id, listing.name)}
                    disabled={loadingId === listing.id}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
