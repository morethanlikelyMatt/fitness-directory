import { createClient } from "@/lib/supabase/server";
import { SubmissionsTable } from "./submissions-table";

export const metadata = {
  title: "Submissions | Admin",
  description: "Review gym submissions and claims",
};

interface Attribute {
  id: string;
  name: string;
  category: string;
}

interface PageProps {
  searchParams: Promise<{
    status?: string;
    type?: string;
    page?: string;
  }>;
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

const ITEMS_PER_PAGE = 20;

async function getSubmissions(
  status?: string,
  type?: string,
  page: number = 1
): Promise<{ submissions: Submission[]; total: number }> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("submissions")
    .select(
      `
      id, type, status, is_owner, submitted_data, submitted_at, user_id, fitness_center_id,
      users(email, name),
      fitness_centers(name, slug)
    `,
      { count: "exact" }
    );

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data, count } = await query
    .order("submitted_at", { ascending: false })
    .range(from, to);

  return {
    submissions: data || [],
    total: count || 0,
  };
}

async function getAttributes(): Promise<Attribute[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from("attributes")
    .select("id, name, category")
    .order("category")
    .order("name");

  if (error) {
    console.error("Error fetching attributes:", error);
    return [];
  }

  return data || [];
}

export default async function AdminSubmissionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status = params.status || "pending";
  const type = params.type || "all";
  const page = parseInt(params.page || "1", 10);

  const [{ submissions, total }, attributes] = await Promise.all([
    getSubmissions(status, type, page),
    getAttributes(),
  ]);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const pendingCount = submissions.filter((s) => s.status === "pending").length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Submissions
          </h1>
          <p className="mt-1 text-zinc-600">
            {total} submissions total
            {pendingCount > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                {pendingCount} pending
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex gap-4">
        <div className="flex rounded-lg border border-zinc-200 bg-white">
          {["pending", "approved", "rejected", "all"].map((s) => (
            <a
              key={s}
              href={`/admin/submissions?status=${s}&type=${type}`}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                status === s
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-50:bg-zinc-700"
              } ${s === "pending" ? "rounded-l-lg" : ""} ${s === "all" ? "rounded-r-lg" : ""}`}
            >
              {s}
            </a>
          ))}
        </div>
        <div className="flex rounded-lg border border-zinc-200 bg-white">
          {[
            { value: "all", label: "All Types" },
            { value: "new_submission", label: "New Submissions" },
            { value: "claim", label: "Claims" },
          ].map((t, i, arr) => (
            <a
              key={t.value}
              href={`/admin/submissions?status=${status}&type=${t.value}`}
              className={`px-4 py-2 text-sm font-medium ${
                type === t.value
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-50"
              } ${i === 0 ? "rounded-l-lg" : ""} ${i === arr.length - 1 ? "rounded-r-lg" : ""}`}
            >
              {t.label}
            </a>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        <SubmissionsTable submissions={submissions} attributes={attributes} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-zinc-600">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/submissions?page=${page - 1}&status=${status}&type=${type}`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50:bg-zinc-800"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/submissions?page=${page + 1}&status=${status}&type=${type}`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50:bg-zinc-800"
              >
                Next
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
