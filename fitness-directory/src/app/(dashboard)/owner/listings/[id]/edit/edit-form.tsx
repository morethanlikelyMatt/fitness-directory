"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  updateListing,
  deleteListing,
  type ListingUpdateData,
} from "../actions";
import type { Attribute, FitnessCenter, Enums } from "@/types/database";

const GYM_TYPES: { value: Enums<"gym_type">; label: string }[] = [
  { value: "commercial", label: "Commercial Gym" },
  { value: "boutique", label: "Boutique Studio" },
  { value: "crossfit", label: "CrossFit Box" },
  { value: "powerlifting", label: "Powerlifting Gym" },
  { value: "24hour", label: "24-Hour Gym" },
  { value: "womens", label: "Women's Only" },
  { value: "rehab", label: "Rehab/Physical Therapy" },
  { value: "university", label: "University Gym" },
  { value: "hotel", label: "Hotel Gym" },
  { value: "community", label: "Community Center" },
];

const PRICE_RANGES: { value: Enums<"price_range">; label: string }[] = [
  { value: "$", label: "$ - Budget Friendly" },
  { value: "$$", label: "$$ - Moderate" },
  { value: "$$$", label: "$$$ - Premium" },
  { value: "$$$$", label: "$$$$ - Luxury" },
];

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

interface ListingWithRelations extends FitnessCenter {
  fitness_center_details: unknown;
  fitness_center_attributes: { attribute_id: string; value: string | null; quantity: number | null }[];
}

interface EditListingFormProps {
  listing: ListingWithRelations;
  attributes: Attribute[];
}

export function EditListingForm({ listing, attributes }: EditListingFormProps) {
  const router = useRouter();

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Extract initial attribute IDs
  const initialAttrIds = listing.fitness_center_attributes?.map(
    (a) => a.attribute_id
  ) || [];
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>(initialAttrIds);

  // Parse hours from JSON if present
  const initialHours =
    typeof listing.hours === "object" && listing.hours !== null
      ? (listing.hours as Record<string, { open: string; close: string }>)
      : {};

  // Form state
  const [formData, setFormData] = useState<ListingUpdateData>({
    name: listing.name,
    description: listing.description || "",
    address: listing.address,
    city: listing.city,
    state: listing.state || "",
    country: listing.country,
    postalCode: listing.postal_code || "",
    phone: listing.phone || "",
    email: listing.email || "",
    website: listing.website || "",
    gymType: listing.gym_type,
    priceRange: listing.price_range || undefined,
    hours: initialHours,
    attributeIds: initialAttrIds,
  });

  function handleInputChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleHoursChange(
    day: string,
    field: "open" | "close",
    value: string
  ) {
    setFormData((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...(prev.hours?.[day] || { open: "", close: "" }),
          [field]: value,
        },
      },
    }));
  }

  function toggleAttribute(attributeId: string) {
    setSelectedAttributes((prev) =>
      prev.includes(attributeId)
        ? prev.filter((id) => id !== attributeId)
        : [...prev, attributeId]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateListing(listing.id, {
        ...formData,
        attributeIds: selectedAttributes,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteListing(listing.id);

      if (result.error) {
        setError(result.error);
        setIsDeleting(false);
      } else if (result.success) {
        router.push("/owner");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setIsDeleting(false);
    }
  }

  // Group attributes by category
  const attributesByCategory = attributes.reduce(
    (acc, attr) => {
      if (!acc[attr.category]) {
        acc[attr.category] = [];
      }
      acc[attr.category].push(attr);
      return acc;
    },
    {} as Record<string, Attribute[]>
  );

  const categoryLabels: Record<string, string> = {
    equipment: "Equipment",
    amenity: "Amenities",
    class: "Classes",
    specialty: "Specialties",
    recovery: "Recovery",
  };

  return (
    <>
      <div className="rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Edit Listing
            </h1>
            <p className="mt-1 text-zinc-600 dark:text-zinc-400">
              Update your fitness center information
            </p>
          </div>
          {listing.subscription_tier === "premium" && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              Premium
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-600 dark:bg-green-900/20 dark:text-green-400">
            Changes saved successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              Basic Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Gym Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="gymType"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Gym Type *
                </label>
                <select
                  id="gymType"
                  name="gymType"
                  required
                  value={formData.gymType}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  {GYM_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="priceRange"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Price Range
                </label>
                <select
                  id="priceRange"
                  name="priceRange"
                  value={formData.priceRange || ""}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  <option value="">Select price range...</option>
                  {PRICE_RANGES.map((range) => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Location */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              Location
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Street Address *
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  City *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  State/Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Country *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              Contact Information
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Website
                </label>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                />
              </div>
            </div>
          </section>

          {/* Hours */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              Operating Hours
            </h2>
            <div className="space-y-3">
              {DAYS.map((day) => (
                <div key={day} className="flex items-center gap-4">
                  <span className="w-24 text-sm font-medium capitalize text-zinc-700 dark:text-zinc-300">
                    {day}
                  </span>
                  <input
                    type="time"
                    value={formData.hours?.[day]?.open || ""}
                    onChange={(e) =>
                      handleHoursChange(day, "open", e.target.value)
                    }
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                  <span className="text-zinc-500">to</span>
                  <input
                    type="time"
                    value={formData.hours?.[day]?.close || ""}
                    onChange={(e) =>
                      handleHoursChange(day, "close", e.target.value)
                    }
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Attributes */}
          <section>
            <h2 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-white">
              Features & Amenities
            </h2>
            <div className="space-y-6">
              {Object.entries(attributesByCategory).map(
                ([category, attrs]) => (
                  <div key={category}>
                    <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-white">
                      {categoryLabels[category] || category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {attrs.map((attr) => (
                        <button
                          key={attr.id}
                          type="button"
                          onClick={() => toggleAttribute(attr.id)}
                          className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                            selectedAttributes.includes(attr.id)
                              ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                              : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
                          }`}
                        >
                          {attr.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          </section>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-zinc-200 pt-6 dark:border-zinc-700">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Delete Listing
            </button>
            <div className="flex gap-3">
              <Link
                href="/owner"
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Delete Listing
            </h3>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Are you sure you want to delete &quot;{listing.name}&quot;?
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
