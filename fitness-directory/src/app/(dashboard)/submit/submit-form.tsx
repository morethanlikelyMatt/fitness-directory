"use client";

import { useState } from "react";
import Link from "next/link";
import { submitNewGym, type SubmissionData } from "./actions";
import type { Attribute, Enums } from "@/types/database";

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

interface SubmitGymFormProps {
  attributes: Attribute[];
}

export function SubmitGymForm({ attributes }: SubmitGymFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState<SubmissionData>({
    name: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    gymType: "commercial",
    website: "",
    phone: "",
    email: "",
    description: "",
    priceRange: undefined,
    isOwner: false,
  });

  function handleInputChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
    setIsLoading(true);
    setError(null);

    try {
      const result = await submitNewGym({
        ...formData,
        attributeIds: selectedAttributes,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.success) {
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
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

  if (success) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Submission Received!
          </h1>
          <p className="mt-2 text-zinc-600">
            Thank you for submitting your fitness center. Our team will review
            your submission and get back to you within 2-3 business days.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800:bg-zinc-100"
            >
              Go to Dashboard
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({
                  name: "",
                  address: "",
                  city: "",
                  state: "",
                  country: "",
                  postalCode: "",
                  gymType: "commercial",
                  website: "",
                  phone: "",
                  email: "",
                  description: "",
                  priceRange: undefined,
                  isOwner: false,
                });
                setSelectedAttributes([]);
              }}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50:bg-zinc-800"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8">
      <h1 className="text-2xl font-bold text-zinc-900">
        Submit a Fitness Center
      </h1>
      <p className="mt-2 text-zinc-600">
        Add your gym to the directory. All submissions are reviewed before
        being published.
      </p>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Basic Info */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            Basic Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="gymName"
                className="block text-sm font-medium text-zinc-700"
              >
                Gym Name *
              </label>
              <input
                type="text"
                id="gymName"
                name="gymName"
                autoComplete="off"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                placeholder="e.g., Iron Paradise Gym"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-zinc-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                placeholder="Tell us about this gym..."
              />
            </div>

            <div>
              <label
                htmlFor="gymType"
                className="block text-sm font-medium text-zinc-700"
              >
                Gym Type *
              </label>
              <select
                id="gymType"
                name="gymType"
                required
                value={formData.gymType}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
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
                className="block text-sm font-medium text-zinc-700"
              >
                Price Range
              </label>
              <select
                id="priceRange"
                name="priceRange"
                value={formData.priceRange || ""}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
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
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            Location
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-zinc-700"
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
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                placeholder="123 Main Street"
              />
            </div>

            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-zinc-700"
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
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="state"
                className="block text-sm font-medium text-zinc-700"
              >
                State/Province
              </label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="country"
                className="block text-sm font-medium text-zinc-700"
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
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>

            <div>
              <label
                htmlFor="postalCode"
                className="block text-sm font-medium text-zinc-700"
              >
                Postal Code
              </label>
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              />
            </div>
          </div>
        </section>

        {/* Contact */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            Contact Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-zinc-700"
              >
                Phone
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                placeholder="contact@gym.com"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="website"
                className="block text-sm font-medium text-zinc-700"
              >
                Website
              </label>
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                placeholder="https://www.yourgym.com"
              />
            </div>
          </div>
        </section>

        {/* Attributes */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-zinc-900">
            Features & Amenities
          </h2>
          <p className="mb-4 text-sm text-zinc-600">
            Select all that apply to this gym
          </p>

          <div className="space-y-6">
            {Object.entries(attributesByCategory).map(
              ([category, attrs]) => (
                <div key={category}>
                  <h3 className="mb-3 text-sm font-medium text-zinc-900">
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
                            ? "bg-zinc-900 text-white"
                            : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200:bg-zinc-700"
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

        {/* Ownership */}
        <section>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="isOwner"
              name="isOwner"
              checked={formData.isOwner}
              onChange={handleInputChange}
              className="mt-1 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-500"
            />
            <label
              htmlFor="isOwner"
              className="text-sm text-zinc-700"
            >
              <span className="font-medium">
                I am the owner or authorized representative
              </span>
              <br />
              <span className="text-zinc-500">
                Check this if you own or manage this fitness center and
                would like to claim this listing
              </span>
            </label>
          </div>
        </section>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-zinc-900 py-3 font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50:bg-zinc-100"
        >
          {isLoading ? "Submitting..." : "Submit for Review"}
        </button>
      </form>
    </div>
  );
}
