import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="text-lg font-bold text-zinc-900 dark:text-white">
              Fitness Directory
            </Link>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Find your perfect gym. Search fitness centers worldwide by
              equipment, amenities, and location.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Browse</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/search?type=commercial"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Commercial Gyms
                </Link>
              </li>
              <li>
                <Link
                  href="/search?type=crossfit"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  CrossFit Boxes
                </Link>
              </li>
              <li>
                <Link
                  href="/search?type=powerlifting"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Powerlifting Gyms
                </Link>
              </li>
              <li>
                <Link
                  href="/search?24hour=true"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  24-Hour Gyms
                </Link>
              </li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">For Owners</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/submit"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Add Your Gym
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Claim Listing
                </Link>
              </li>
              <li>
                <Link
                  href="/owner"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Owner Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-white">Company</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} Fitness Directory. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
