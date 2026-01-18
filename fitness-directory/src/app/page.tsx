import Link from "next/link";
import { WebsiteJsonLd } from "@/components/seo/json-ld";
import { HomeSearchForm } from "@/components/search/home-search-form";

export default function Home() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fitnessdirectory.com";

  return (
    <div className="min-h-screen bg-[#FFFBF7]">
      <WebsiteJsonLd
        name="Fitness Directory"
        url={appUrl}
        description="Discover fitness centers worldwide. Search by equipment, amenities, location, and specialties."
      />

      {/* Navigation */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-stone-900">Fitness Directory</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/search"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Browse Gyms
            </Link>
            <Link
              href="/submit"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              List Your Gym
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-orange-600 hover:to-amber-600 transition-all"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50/50 to-transparent" />
          <div className="absolute top-20 right-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-20 w-72 h-72 bg-amber-200/40 rounded-full blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-32">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-1.5 text-sm font-medium text-orange-700 mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                Trusted by 10,000+ fitness enthusiasts
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.1]">
                Find the Perfect
                <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent"> Gym </span>
                for Your Goals
              </h1>

              <p className="mt-6 text-xl text-stone-600 leading-relaxed max-w-2xl">
                Discover fitness centers tailored to your needs. Compare equipment, read reviews,
                and find your ideal workout space — all in one place.
              </p>

              {/* Search Bar */}
              <div className="mt-10 max-w-2xl">
                <HomeSearchForm />

                <div className="mt-4 flex items-center gap-4 text-sm text-stone-500">
                  <span>Popular:</span>
                  <Link href="/search?q=crossfit" className="text-orange-600 hover:text-orange-700 font-medium">CrossFit</Link>
                  <Link href="/search?q=powerlifting" className="text-orange-600 hover:text-orange-700 font-medium">Powerlifting</Link>
                  <Link href="/search?q=24+hour" className="text-orange-600 hover:text-orange-700 font-medium">24-Hour</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-stone-200 bg-white py-12">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { value: "5,000+", label: "Gyms Listed" },
                { value: "50+", label: "Cities Covered" },
                { value: "100k+", label: "Monthly Searches" },
                { value: "4.8/5", label: "User Rating" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-stone-900">{stat.value}</div>
                  <div className="mt-1 text-sm text-stone-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-stone-900">
                Browse by Category
              </h2>
              <p className="mt-3 text-lg text-stone-600">
                Find the right gym for your training style
              </p>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { name: "Commercial Gyms", slug: "commercial", icon: "🏢" },
                { name: "CrossFit Boxes", slug: "crossfit", icon: "🏋️" },
                { name: "Powerlifting", slug: "powerlifting", icon: "💪" },
                { name: "24-Hour Access", slug: "24hour", icon: "🕐" },
                { name: "Boutique Studios", slug: "boutique", icon: "✨" },
                { name: "Yoga Studios", slug: "yoga", icon: "🧘" },
              ].map((category) => (
                <Link
                  key={category.slug}
                  href={`/search?type=${category.slug}`}
                  className="group rounded-2xl border border-stone-200 bg-white p-6 text-center transition-all hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/50"
                >
                  <span className="text-3xl">{category.icon}</span>
                  <span className="mt-3 block text-sm font-semibold text-stone-900 group-hover:text-orange-600">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-stone-900 py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white">
                Why Choose Fitness Directory?
              </h2>
              <p className="mt-3 text-lg text-stone-400">
                The smarter way to find your next gym
              </p>
            </div>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {[
                {
                  title: "Detailed Equipment Lists",
                  description: "Know exactly what equipment a gym has before you visit. Filter by squat racks, deadlift platforms, and more.",
                  icon: (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  ),
                },
                {
                  title: "Verified Reviews",
                  description: "Read honest reviews from real gym members. Get the inside scoop on atmosphere, crowd levels, and more.",
                  icon: (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                  ),
                },
                {
                  title: "Compare & Decide",
                  description: "Side-by-side comparison of pricing, amenities, and hours. Make an informed decision before committing.",
                  icon: (
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  ),
                },
              ].map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-stone-800 bg-stone-800/50 p-8"
                >
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white">
                    {feature.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-stone-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 px-8 py-16 text-center shadow-xl">
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
              <div className="relative">
                <h2 className="text-3xl font-bold text-white">
                  Own a Fitness Center?
                </h2>
                <p className="mt-4 text-lg text-orange-100 max-w-2xl mx-auto">
                  Join thousands of gyms already on Fitness Directory. Reach new members,
                  showcase your equipment, and grow your business.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/submit"
                    className="rounded-full bg-white px-8 py-3 font-semibold text-orange-600 shadow-sm hover:bg-orange-50 transition-colors"
                  >
                    List Your Gym — It&apos;s Free
                  </Link>
                  <Link
                    href="/pricing"
                    className="rounded-full border-2 border-white/30 px-8 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
                  >
                    View Premium Plans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-stone-900">Fitness Directory</span>
              </Link>
              <p className="mt-3 text-sm text-stone-500">
                The smarter way to find your perfect gym.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-stone-900">Explore</h4>
              <ul className="mt-4 space-y-2 text-sm text-stone-600">
                <li><Link href="/search" className="hover:text-orange-600">Browse Gyms</Link></li>
                <li><Link href="/cities" className="hover:text-orange-600">Cities</Link></li>
                <li><Link href="/equipment" className="hover:text-orange-600">Equipment</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-stone-900">For Gym Owners</h4>
              <ul className="mt-4 space-y-2 text-sm text-stone-600">
                <li><Link href="/submit" className="hover:text-orange-600">List Your Gym</Link></li>
                <li><Link href="/pricing" className="hover:text-orange-600">Pricing</Link></li>
                <li><Link href="/owner" className="hover:text-orange-600">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-stone-900">Company</h4>
              <ul className="mt-4 space-y-2 text-sm text-stone-600">
                <li><Link href="/about" className="hover:text-orange-600">About</Link></li>
                <li><Link href="/contact" className="hover:text-orange-600">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-orange-600">Privacy</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-stone-200 pt-8 text-center text-sm text-stone-500">
            &copy; {new Date().getFullYear()} Fitness Directory. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
