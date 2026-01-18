import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-stone-900">Fitness Directory</span>
            </Link>
            <p className="mt-3 text-sm text-stone-500 leading-relaxed">
              Find your perfect gym. Search fitness centers worldwide by
              equipment, amenities, and location.
            </p>
          </div>

          {/* Browse */}
          <div>
            <h3 className="font-semibold text-stone-900">Browse</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/search?type=commercial"
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                >
                  Commercial Gyms
                </Link>
              </li>
              <li>
                <Link
                  href="/search?type=crossfit"
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                >
                  CrossFit Boxes
                </Link>
              </li>
              <li>
                <Link
                  href="/search?type=powerlifting"
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                >
                  Powerlifting Gyms
                </Link>
              </li>
              <li>
                <Link
                  href="/search?24hour=true"
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                >
                  24-Hour Gyms
                </Link>
              </li>
            </ul>
          </div>

          {/* For Owners */}
          <div>
            <h3 className="font-semibold text-stone-900">For Owners</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/submit"
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                >
                  Add Your Gym
                </Link>
              </li>
              <li>
                <Link
                  href="/submit"
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                >
                  Claim Listing
                </Link>
              </li>
              <li>
                <Link
                  href="/owner"
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                >
                  Owner Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-stone-900">Company</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-stone-600 hover:text-orange-600 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-stone-200 pt-8">
          <p className="text-center text-sm text-stone-500">
            &copy; {new Date().getFullYear()} Fitness Directory. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
