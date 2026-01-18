import Link from "next/link";
import { WebsiteJsonLd } from "@/components/seo/json-ld";

export default function Home() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fitnessdirectory.com";

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <WebsiteJsonLd
        name="Fitness Directory"
        url={appUrl}
        description="Discover fitness centers worldwide. Search by equipment, amenities, location, and specialties."
      />
      {/* Hero Section */}
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold text-zinc-900 dark:text-white">
            Fitness Directory
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Get started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
            Find Your Perfect Gym
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Discover fitness centers worldwide. Search by equipment, amenities,
            location, and specialties.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-10 max-w-2xl">
            <form action="/search" className="flex gap-2">
              <input
                type="text"
                name="q"
                placeholder="Search gyms, equipment, or location..."
                className="flex-1 rounded-lg border border-zinc-300 px-4 py-3 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:placeholder-zinc-400"
              />
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
              >
                Search
              </button>
            </form>
          </div>
        </section>

        {/* Categories */}
        <section className="border-t border-zinc-200 bg-zinc-50 py-16 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-2xl font-bold text-zinc-900 dark:text-white">
              Browse by Category
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { name: "Commercial Gyms", slug: "commercial" },
                { name: "CrossFit Boxes", slug: "crossfit" },
                { name: "Powerlifting", slug: "powerlifting" },
                { name: "24-Hour Gyms", slug: "24hour" },
                { name: "Boutique Studios", slug: "boutique" },
                { name: "Rehab & PT", slug: "rehab" },
              ].map((category) => (
                <Link
                  key={category.slug}
                  href={`/search?type=${category.slug}`}
                  className="rounded-lg border border-zinc-200 bg-white p-4 text-center transition-colors hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-500"
                >
                  <span className="text-sm font-medium text-zinc-900 dark:text-white">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
              Own a Fitness Center?
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Claim your listing and connect with new members.
            </p>
            <Link
              href="/submit"
              className="mt-6 inline-block rounded-lg bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Submit Your Gym
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-8 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          &copy; {new Date().getFullYear()} Fitness Directory. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
