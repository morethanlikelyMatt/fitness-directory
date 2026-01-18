import { createClient } from "@/lib/supabase/server";
import { UsersTable } from "./users-table";

export const metadata = {
  title: "Users | Admin",
  description: "Manage users",
};

interface PageProps {
  searchParams: Promise<{
    role?: string;
    page?: string;
    search?: string;
  }>;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  created_at: string;
}

const ITEMS_PER_PAGE = 20;

async function getUsers(
  role?: string,
  page: number = 1,
  search?: string
): Promise<{ users: User[]; total: number }> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("users")
    .select("id, email, name, role, created_at", { count: "exact" });

  if (role && role !== "all") {
    query = query.eq("role", role);
  }

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
  }

  const from = (page - 1) * ITEMS_PER_PAGE;
  const to = from + ITEMS_PER_PAGE - 1;

  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  return {
    users: data || [],
    total: count || 0,
  };
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const role = params.role || "all";
  const page = parseInt(params.page || "1", 10);
  const search = params.search || "";

  const { users, total } = await getUsers(role, page, search);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Users
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          {total} users total
        </p>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-4">
        <form className="flex-1">
          <input
            type="text"
            name="search"
            placeholder="Search by email or name..."
            defaultValue={search}
            className="w-full max-w-xs rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm focus:border-zinc-400 focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
          />
        </form>
        <div className="flex rounded-lg border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
          {["all", "user", "owner", "admin"].map((r) => (
            <a
              key={r}
              href={`/admin/users?role=${r}&search=${search}`}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                role === r
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-700"
              } ${r === "all" ? "rounded-l-lg" : ""} ${r === "admin" ? "rounded-r-lg" : ""}`}
            >
              {r === "all" ? "All" : r + "s"}
            </a>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="mt-6">
        <UsersTable users={users} />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <a
                href={`/admin/users?page=${page - 1}&role=${role}&search=${search}`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                Previous
              </a>
            )}
            {page < totalPages && (
              <a
                href={`/admin/users?page=${page + 1}&role=${role}&search=${search}`}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
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
