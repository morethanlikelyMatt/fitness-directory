import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/auth";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

async function getListing(id: string) {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: listing, error } = await (supabase as any)
    .from("fitness_centers")
    .select(
      `
      *,
      fitness_center_attributes (
        attribute_id,
        attributes (name, category)
      ),
      users:owner_id (email, name)
    `
    )
    .eq("id", id)
    .single();

  if (error || !listing) {
    return null;
  }

  return listing;
}

async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("users")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role === "admin";
}

const gymTypeLabels: Record<string, string> = {
  commercial: "Commercial Gym",
  boutique: "Boutique Studio",
  crossfit: "CrossFit Box",
  powerlifting: "Powerlifting Gym",
  "24hour": "24-Hour Gym",
  womens: "Women's Only",
  rehab: "Rehab/Physical Therapy",
  university: "University Gym",
  hotel: "Hotel Gym",
  community: "Community Center",
};

const statusLabels: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  verified: { label: "Verified", className: "bg-green-100 text-green-700" },
  claimed: { label: "Claimed", className: "bg-green-100 text-green-700" },
  suspended: { label: "Suspended", className: "bg-red-100 text-red-700" },
};

export default async function AdminEditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const admin = await isAdmin(user.id);
  if (!admin) {
    redirect("/dashboard");
  }

  const listing = await getListing(id);

  if (!listing) {
    notFound();
  }

  const status = statusLabels[listing.status] || { label: listing.status, className: "bg-zinc-100 text-zinc-700" };

  // Group attributes by category
  const attributesByCategory: Record<string, string[]> = {};
  if (listing.fitness_center_attributes) {
    for (const attr of listing.fitness_center_attributes) {
      const attrData = attr.attributes as { name: string; category: string } | null;
      if (attrData) {
        if (!attributesByCategory[attrData.category]) {
          attributesByCategory[attrData.category] = [];
        }
        attributesByCategory[attrData.category].push(attrData.name);
      }
    }
  }

  const categoryLabels: Record<string, string> = {
    equipment: "Equipment",
    amenity: "Amenities",
    class: "Classes",
    specialty: "Specialties",
    recovery: "Recovery",
  };

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/listings"
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Back to Listings
        </Link>
      </div>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{listing.name}</h1>
          <p className="mt-1 text-zinc-600">{listing.city}, {listing.country}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${status.className}`}>
            {status.label}
          </span>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${
            listing.subscription_tier === "premium"
              ? "bg-amber-100 text-amber-700"
              : "bg-zinc-100 text-zinc-600"
          }`}>
            {listing.subscription_tier}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Basic Information</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Type</dt>
              <dd className="text-zinc-900">{gymTypeLabels[listing.gym_type] || listing.gym_type}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Price Range</dt>
              <dd className="text-zinc-900">{listing.price_range || "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Slug</dt>
              <dd className="text-zinc-900 font-mono text-xs">{listing.slug}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Created</dt>
              <dd className="text-zinc-900">
                {new Date(listing.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
          {listing.description && (
            <div className="mt-4 pt-4 border-t border-zinc-100">
              <p className="text-sm text-zinc-500 mb-1">Description</p>
              <p className="text-sm text-zinc-700">{listing.description}</p>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Location</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Address</dt>
              <dd className="text-zinc-900">{listing.address}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">City</dt>
              <dd className="text-zinc-900">{listing.city}</dd>
            </div>
            {listing.state && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">State</dt>
                <dd className="text-zinc-900">{listing.state}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-zinc-500">Country</dt>
              <dd className="text-zinc-900">{listing.country}</dd>
            </div>
            {listing.postal_code && (
              <div className="flex justify-between">
                <dt className="text-zinc-500">Postal Code</dt>
                <dd className="text-zinc-900">{listing.postal_code}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-zinc-500">Coordinates</dt>
              <dd className="text-zinc-900">
                <a
                  href={`https://maps.google.com/?q=${listing.latitude},${listing.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Map
                </a>
              </dd>
            </div>
          </dl>
        </div>

        {/* Contact */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Contact</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500">Phone</dt>
              <dd className="text-zinc-900">{listing.phone || "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Email</dt>
              <dd className="text-zinc-900">{listing.email || "Not set"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500">Website</dt>
              <dd className="text-zinc-900">
                {listing.website ? (
                  <a href={listing.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {listing.website}
                  </a>
                ) : "Not set"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Owner */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Owner</h2>
          {listing.users ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-zinc-500">Email</dt>
                <dd className="text-zinc-900">{listing.users.email}</dd>
              </div>
              {listing.users.name && (
                <div className="flex justify-between">
                  <dt className="text-zinc-500">Name</dt>
                  <dd className="text-zinc-900">{listing.users.name}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-zinc-500 italic">No owner assigned</p>
          )}
        </div>
      </div>

      {/* Attributes */}
      {Object.keys(attributesByCategory).length > 0 && (
        <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6">
          <h2 className="font-semibold text-zinc-900 mb-4">Features & Amenities</h2>
          <div className="space-y-4">
            {Object.entries(attributesByCategory).map(([category, attrs]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-zinc-700 mb-2">
                  {categoryLabels[category] || category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {attrs.map((name) => (
                    <span
                      key={name}
                      className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex gap-3">
        {(listing.status === "verified" || listing.status === "claimed") && (
          <Link
            href={`/gym/${listing.slug}`}
            target="_blank"
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            View Public Page
          </Link>
        )}
      </div>
    </div>
  );
}
