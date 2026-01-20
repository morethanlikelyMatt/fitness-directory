"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { BusinessProfile } from "@/types/database";
import { saveBusinessProfile } from "./actions";

interface BusinessProfileFormProps {
  userId: string;
  existingProfile: BusinessProfile | null;
}

export function BusinessProfileForm({ userId, existingProfile }: BusinessProfileFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await saveBusinessProfile(formData, userId, existingProfile?.id);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600">
          Business profile saved successfully!
        </div>
      )}

      {/* Business Name */}
      <div>
        <label htmlFor="business_name" className="block text-sm font-medium text-zinc-700">
          Business Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="business_name"
          name="business_name"
          required
          defaultValue={existingProfile?.business_name || ""}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="Your Company Name"
        />
      </div>

      {/* Business Email */}
      <div>
        <label htmlFor="business_email" className="block text-sm font-medium text-zinc-700">
          Business Email
        </label>
        <input
          type="email"
          id="business_email"
          name="business_email"
          defaultValue={existingProfile?.business_email || ""}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="contact@yourbusiness.com"
        />
      </div>

      {/* Business Phone */}
      <div>
        <label htmlFor="business_phone" className="block text-sm font-medium text-zinc-700">
          Business Phone
        </label>
        <input
          type="tel"
          id="business_phone"
          name="business_phone"
          defaultValue={existingProfile?.business_phone || ""}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      {/* Website */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-zinc-700">
          Website
        </label>
        <input
          type="url"
          id="website"
          name="website"
          defaultValue={existingProfile?.website || ""}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="https://yourbusiness.com"
        />
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-200 pt-6">
        <h3 className="text-sm font-semibold text-zinc-900">Business Address</h3>
        <p className="mt-1 text-sm text-zinc-500">
          This is your business headquarters address, not individual gym locations.
        </p>
      </div>

      {/* Business Address */}
      <div>
        <label htmlFor="business_address" className="block text-sm font-medium text-zinc-700">
          Street Address
        </label>
        <input
          type="text"
          id="business_address"
          name="business_address"
          defaultValue={existingProfile?.business_address || ""}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="123 Business Ave"
        />
      </div>

      {/* City and State */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="business_city" className="block text-sm font-medium text-zinc-700">
            City
          </label>
          <input
            type="text"
            id="business_city"
            name="business_city"
            defaultValue={existingProfile?.business_city || ""}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            placeholder="New York"
          />
        </div>
        <div>
          <label htmlFor="business_state" className="block text-sm font-medium text-zinc-700">
            State/Province
          </label>
          <input
            type="text"
            id="business_state"
            name="business_state"
            defaultValue={existingProfile?.business_state || ""}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            placeholder="NY"
          />
        </div>
      </div>

      {/* Country and Postal Code */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="business_country" className="block text-sm font-medium text-zinc-700">
            Country
          </label>
          <input
            type="text"
            id="business_country"
            name="business_country"
            defaultValue={existingProfile?.business_country || ""}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            placeholder="United States"
          />
        </div>
        <div>
          <label htmlFor="business_postal_code" className="block text-sm font-medium text-zinc-700">
            Postal Code
          </label>
          <input
            type="text"
            id="business_postal_code"
            name="business_postal_code"
            defaultValue={existingProfile?.business_postal_code || ""}
            className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            placeholder="10001"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-200 pt-6">
        <h3 className="text-sm font-semibold text-zinc-900">Tax Information</h3>
        <p className="mt-1 text-sm text-zinc-500">
          Optional. This information is kept private and may be used for invoicing.
        </p>
      </div>

      {/* Tax ID */}
      <div>
        <label htmlFor="tax_id" className="block text-sm font-medium text-zinc-700">
          Tax ID / EIN
        </label>
        <input
          type="text"
          id="tax_id"
          name="tax_id"
          defaultValue={existingProfile?.tax_id || ""}
          className="mt-1 block w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          placeholder="XX-XXXXXXX"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : existingProfile ? "Update Profile" : "Create Profile"}
        </button>
      </div>
    </form>
  );
}
