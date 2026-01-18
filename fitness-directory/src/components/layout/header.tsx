import Link from "next/link";
import { getUser } from "@/lib/supabase/auth";
import { UserMenu } from "./user-menu";

interface HeaderProps {
  showSearch?: boolean;
}

export async function Header({ showSearch = true }: HeaderProps) {
  const user = await getUser();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/80">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="shrink-0 text-lg font-bold text-zinc-900 dark:text-white"
        >
          Fitness Directory
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
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            className="hidden text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white sm:block"
          >
            Browse
          </Link>

          {user ? (
            <UserMenu user={user} />
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              >
                Sign in
              </Link>
              <Link
                href="/submit"
                className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Add Gym
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Search Bar (mobile) */}
      {showSearch && (
        <div className="border-t border-zinc-100 px-4 py-2 dark:border-zinc-800 md:hidden">
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
        className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-sm text-zinc-900 placeholder-zinc-500 focus:border-zinc-400 focus:bg-white focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:placeholder-zinc-400 dark:focus:border-zinc-600"
      />
      <button
        type="submit"
        className="rounded-lg bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
      >
        Search
      </button>
    </form>
  );
}
