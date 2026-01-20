import Link from "next/link";
import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { UserMenu } from "./user-menu";

interface HeaderProps {
  showSearch?: boolean;
}

export async function Header({ showSearch = true }: HeaderProps) {
  const user = await getUser();

  // Get user role if logged in
  let isBusinessUser = false;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    isBusinessUser = data?.role === "owner" || data?.role === "admin";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/80 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-stone-900">Fitness Directory</span>
        </Link>

        {/* Search Bar (desktop) */}
        {showSearch && (
          <div className="hidden flex-1 md:block">
            <div className="mx-auto max-w-xl">
              <SearchBarCompact />
            </div>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 md:hidden" />

        {/* Nav Links */}
        <div className="flex items-center gap-4">
          <Link
            href="/search"
            className="hidden text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors sm:block"
          >
            Browse
          </Link>

          {user ? (
            <UserMenu user={user} isBusinessUser={isBusinessUser} />
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/submit"
                className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white hover:from-orange-600 hover:to-amber-600 transition-all"
              >
                Add Gym
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Search Bar (mobile) */}
      {showSearch && (
        <div className="border-t border-stone-100 px-4 py-2 md:hidden">
          <SearchBarCompact />
        </div>
      )}
    </header>
  );
}

// Compact search bar for header
function SearchBarCompact() {
  return (
    <form action="/search" className="flex gap-2">
      <input
        type="text"
        name="q"
        placeholder="Search gyms..."
        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
      />
      <button
        type="submit"
        className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white hover:from-orange-600 hover:to-amber-600 transition-all"
      >
        Search
      </button>
    </form>
  );
}
