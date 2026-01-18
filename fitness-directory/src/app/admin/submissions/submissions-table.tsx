"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { approveSubmission, rejectSubmission } from "./actions";

// Field labels for display
const FIELD_LABELS: Record<string, string> = {
  name: "Gym Name",
  address: "Street Address",
  city: "City",
  state: "State/Province",
  country: "Country",
  postal_code: "Postal Code",
  gym_type: "Gym Type",
  price_range: "Price Range",
  website: "Website",
  phone: "Phone",
  email: "Email",
  description: "Description",
  latitude: "Latitude",
  longitude: "Longitude",
  slug: "URL Slug",
  attribute_ids: "Selected Attributes",
  verification_notes: "Verification Notes",
};

// Format gym type for display
function formatGymType(type: string): string {
  const types: Record<string, string> = {
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
  return types[type] || type;
}

interface AttributeInfo {
  id: string;
  name: string;
  category: string;
}

const categoryLabels: Record<string, string> = {
  equipment: "Equipment",
  amenity: "Amenities",
  class: "Classes",
  specialty: "Specialties",
  recovery: "Recovery",
};

function SubmissionDetails({ data, type, attributes }: { data: Record<string, unknown>; type: string; attributes: AttributeInfo[] }) {
  if (type === "claim") {
    return (
      <div>
        <h4 className="text-sm font-medium text-zinc-900 mb-4">Claim Details</h4>
        {data.verification_notes ? (
          <div className="bg-white rounded-lg p-4 border border-zinc-200">
            <p className="text-sm font-medium text-zinc-700">Verification Notes</p>
            <p className="mt-1 text-zinc-600">{String(data.verification_notes)}</p>
          </div>
        ) : (
          <p className="text-sm text-zinc-500 italic">No verification notes provided</p>
        )}
      </div>
    );
  }

  // New submission - show all gym details
  const fields = [
    { key: "name", section: "basic" },
    { key: "gym_type", section: "basic" },
    { key: "price_range", section: "basic" },
    { key: "description", section: "basic" },
    { key: "address", section: "location" },
    { key: "city", section: "location" },
    { key: "state", section: "location" },
    { key: "country", section: "location" },
    { key: "postal_code", section: "location" },
    { key: "website", section: "contact" },
    { key: "phone", section: "contact" },
    { key: "email", section: "contact" },
  ];

  const basicFields = fields.filter(f => f.section === "basic");
  const locationFields = fields.filter(f => f.section === "location");
  const contactFields = fields.filter(f => f.section === "contact");

  const renderValue = (key: string, value: unknown) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-zinc-400 italic">Not provided</span>;
    }
    if (key === "gym_type") {
      return formatGymType(String(value));
    }
    if (key === "website" && typeof value === "string") {
      return (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    }
    if (key === "email" && typeof value === "string") {
      return (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    }
    if (key === "description" && typeof value === "string") {
      return <span className="whitespace-pre-wrap">{value}</span>;
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <div>
        <h4 className="text-sm font-medium text-zinc-900 mb-3">Basic Information</h4>
        <div className="bg-white rounded-lg border border-zinc-200 divide-y divide-zinc-100">
          {basicFields.map(({ key }) => (
            <div key={key} className="flex px-4 py-3">
              <span className="w-32 flex-shrink-0 text-sm font-medium text-zinc-500">
                {FIELD_LABELS[key] || key}
              </span>
              <span className="text-sm text-zinc-900">
                {renderValue(key, data[key])}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Location */}
      <div>
        <h4 className="text-sm font-medium text-zinc-900 mb-3">Location</h4>
        <div className="bg-white rounded-lg border border-zinc-200 divide-y divide-zinc-100">
          {locationFields.map(({ key }) => (
            <div key={key} className="flex px-4 py-3">
              <span className="w-32 flex-shrink-0 text-sm font-medium text-zinc-500">
                {FIELD_LABELS[key] || key}
              </span>
              <span className="text-sm text-zinc-900">
                {renderValue(key, data[key])}
              </span>
            </div>
          ))}
          {data.latitude && data.longitude && (
            <div className="flex px-4 py-3">
              <span className="w-32 flex-shrink-0 text-sm font-medium text-zinc-500">
                Coordinates
              </span>
              <span className="text-sm text-zinc-900">
                {String(data.latitude)}, {String(data.longitude)}
                <a
                  href={`https://maps.google.com/?q=${data.latitude},${data.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline"
                >
                  View on Map
                </a>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Contact */}
      <div>
        <h4 className="text-sm font-medium text-zinc-900 mb-3">Contact Information</h4>
        <div className="bg-white rounded-lg border border-zinc-200 divide-y divide-zinc-100">
          {contactFields.map(({ key }) => (
            <div key={key} className="flex px-4 py-3">
              <span className="w-32 flex-shrink-0 text-sm font-medium text-zinc-500">
                {FIELD_LABELS[key] || key}
              </span>
              <span className="text-sm text-zinc-900">
                {renderValue(key, data[key])}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Attributes */}
      {Array.isArray(data.attribute_ids) && data.attribute_ids.length > 0 && (() => {
        // Look up attribute names and group by category
        const selectedAttributes = (data.attribute_ids as string[])
          .map(id => attributes.find(a => a.id === id))
          .filter((a): a is AttributeInfo => a !== undefined);

        // Group by category
        const byCategory: Record<string, string[]> = {};
        for (const attr of selectedAttributes) {
          if (!byCategory[attr.category]) {
            byCategory[attr.category] = [];
          }
          byCategory[attr.category].push(attr.name);
        }

        const categoryOrder = ["equipment", "amenity", "class", "specialty", "recovery"];

        return (
          <div>
            <h4 className="text-sm font-medium text-zinc-900 mb-3">Selected Features</h4>
            <div className="bg-white rounded-lg border border-zinc-200 p-4 space-y-4">
              {categoryOrder.map(category => {
                const items = byCategory[category];
                if (!items || items.length === 0) return null;
                return (
                  <div key={category}>
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide mb-2">
                      {categoryLabels[category] || category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {items.map(name => (
                        <span
                          key={name}
                          className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700"
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

interface Submission {
  id: string;
  type: string;
  status: string;
  is_owner: boolean;
  submitted_data: Record<string, unknown>;
  submitted_at: string;
  user_id: string;
  fitness_center_id: string | null;
  users: { email: string; name: string | null } | null;
  fitness_centers: { name: string; slug: string } | null;
}

interface Attribute {
  id: string;
  name: string;
  category: string;
}

interface SubmissionsTableProps {
  submissions: Submission[];
  attributes: Attribute[];
}

export function SubmissionsTable({ submissions, attributes }: SubmissionsTableProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    await approveSubmission(id);
    setLoadingId(null);
    router.refresh();
  };

  const handleReject = async (id: string) => {
    const notes = prompt("Rejection reason (optional):");
    setLoadingId(id);
    await rejectSubmission(id, notes || undefined);
    setLoadingId(null);
    router.refresh();
  };

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center">
        <p className="text-zinc-500">No submissions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => {
        const data = submission.submitted_data as {
          name?: string;
          city?: string;
          country?: string;
          gym_type?: string;
          address?: string;
        };

        const isExpanded = expandedId === submission.id;

        return (
          <div
            key={submission.id}
            className={`rounded-xl border bg-white ${
              submission.status === "pending"
                ? "border-amber-200"
                : "border-zinc-200"
            } ${loadingId === submission.id ? "opacity-50" : ""}`}
          >
            <div className="flex items-start justify-between p-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      submission.type === "new_submission"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {submission.type === "new_submission" ? "New Gym" : "Claim"}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      submission.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : submission.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {submission.status}
                  </span>
                  {submission.is_owner && (
                    <span className="text-xs text-zinc-500">Owner claim</span>
                  )}
                </div>

                <h3 className="mt-2 font-semibold text-zinc-900">
                  {submission.fitness_centers
                    ? submission.fitness_centers.name
                    : data.name || "Unnamed submission"}
                </h3>

                {submission.type === "new_submission" && data.city && (
                  <p className="text-sm text-zinc-600">
                    {data.city}, {data.country}
                  </p>
                )}

                <div className="mt-2 flex items-center gap-4 text-sm text-zinc-500">
                  <span>
                    Submitted by: {submission.users?.email || "Unknown"}
                  </span>
                  <span>
                    {new Date(submission.submitted_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {submission.type === "claim" && submission.fitness_centers && (
                  <Link
                    href={`/gym/${submission.fitness_centers.slug}`}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50:bg-zinc-800"
                  >
                    View Gym
                  </Link>
                )}
                {submission.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(submission.id)}
                      disabled={loadingId === submission.id}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(submission.id)}
                      disabled={loadingId === submission.id}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50:bg-red-900/20"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : submission.id)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-50:bg-zinc-800"
                >
                  {isExpanded ? "Hide Details" : "View Details"}
                </button>
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-zinc-200 bg-zinc-50 p-6">
                <SubmissionDetails data={submission.submitted_data} type={submission.type} attributes={attributes} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
