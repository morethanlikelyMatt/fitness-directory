"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { logout } from "@/app/(auth)/actions/auth";

interface UserMenuProps {
  user: User;
  isBusinessUser?: boolean;
}

export function UserMenu({ user, isBusinessUser = false }: UserMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Get display name
  const displayName =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "User";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Close menu on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setIsOpen(false);
    await logout();
    router.refresh();
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-zinc-200 px-2 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50:bg-zinc-800"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-xs text-white">
          {initials}
        </div>
        <span className="hidden sm:block">{displayName}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg">
          <div className="border-b border-zinc-100 px-4 py-2">
            <p className="text-sm font-medium text-zinc-900">
              {displayName}
            </p>
            <p className="text-xs text-zinc-500">{user.email}</p>
          </div>

          <div className="py-1">
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Dashboard
            </Link>
            {isBusinessUser ? (
              <>
                <Link
                  href="/owner"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  My Listings
                </Link>
                <Link
                  href="/submit"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  Add a Gym
                </Link>
              </>
            ) : (
              <Link
                href="/signup/business"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                Become a Business Owner
              </Link>
            )}
          </div>

          <div className="border-t border-zinc-100 py-1">
            <button
              onClick={handleLogout}
              className="block w-full px-4 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50:bg-zinc-800"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
