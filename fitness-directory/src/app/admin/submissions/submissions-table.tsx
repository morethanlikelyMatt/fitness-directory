"use client";

import { useState } from "react";
import Link from "next/link";
import { approveSubmission, rejectSubmission } from "./actions";

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

interface SubmissionsTableProps {
  submissions: Submission[];
}

export function SubmissionsTable({ submissions }: SubmissionsTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setLoadingId(id);
    await approveSubmission(id);
    setLoadingId(null);
  };

  const handleReject = async (id: string) => {
    const notes = prompt("Rejection reason (optional):");
    setLoadingId(id);
    await rejectSubmission(id, notes || undefined);
    setLoadingId(null);
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
                  {submission.type === "claim" && submission.fitness_centers
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
                <h4 className="text-sm font-medium text-zinc-900">
                  Submitted Data
                </h4>
                <pre className="mt-2 overflow-x-auto rounded-lg bg-white p-4 text-xs text-zinc-700">
                  {JSON.stringify(submission.submitted_data, null, 2)}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
