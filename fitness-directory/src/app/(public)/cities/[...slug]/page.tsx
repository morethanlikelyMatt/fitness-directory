import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { Header, Footer } from "@/components/layout";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

interface CityPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

interface GymListing {
  id: string;
  name: string;
  slug: string;
  address: string;
  gym_type: string;
  price_range: string | null;
  subscription_tier: string;
}

function parseSlug(slug: string[]): { country: string; state?: string; city: string } | null {
  if (slug.length === 2) {
    return { country: slug[0], city: slug[1] };
  } else if (slug.length === 3) {
    return { country: slug[0], state: slug[1], city: slug[2] };
  }
  return null;
}

function formatLocation(country: string, state?: string, city?: string): string {
  const parts = [city, state, country].filter(Boolean);
  return parts.map((p) => p!.charAt(0).toUpperCase() + p!.slice(1)).join(", ");
}

async function getCityGyms(
  country: string,
  city: string,
  state?: string
): Promise<{ gyms: GymListing[]; cityName: string; stateName?: string; countryName: string }> {
  const supabase = await createServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = (supabase as any)
    .from("fitness_centers")
    .select("id, name, slug, address, gym_type, price_range, subscription_tier")
    .in("status", ["verified", "claimed"])
    .ilike("country", country)
    .ilike("city", city);

  if (state && state !== "_") {
    query = query.ilike("state", state);
  }

  const { data: gyms } = await query.order("subscription_tier", { ascending: false }).order("name");

  if (!gyms || gyms.length === 0) {
    return { gyms: [], cityName: city, stateName: state, countryName: country };
  }

  return {
    gyms: gyms as GymListing[],
    cityName: city.charAt(0).toUpperCase() + city.slice(1),
    stateName: state ? state.charAt(0).toUpperCase() + state.slice(1) : undefined,
    countryName: country.charAt(0).toUpperCase() + country.slice(1),
  };
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);

  if (!parsed) {
    return { title: "Not Found" };
  }

  const { cityName, stateName, countryName } = await getCityGyms(
    parsed.country,
    parsed.city,
    parsed.state
  );

  const location = formatLocation(countryName, stateName, cityName);

  return {
    title: `Gyms in ${location} | Fitness Directory`,
    description: `Find the best gyms, fitness centers, and workout facilities in ${location}. Browse equipment, amenities, hours, and more.`,
    openGraph: {
      title: `Gyms in ${location}`,
      description: `Discover fitness centers in ${location}`,
    },
  };
}

const gymTypeLabels: Record<string, string> = {
  commercial: "Commercial Gym",
  boutique: "Boutique Studio",
  crossfit: "CrossFit Box",
  powerlifting: "Powerlifting Gym",
  "24hour": "24-Hour Gym",
  womens: "Women's Only",
  rehab: "Rehab Center",
  university: "University Gym",
  hotel: "Hotel Gym",
  community: "Community Center",
};

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  const parsed = parseSlug(slug);

  if (!parsed) {
    notFound();
  }

  const { gyms, cityName, stateName, countryName } = await getCityGyms(
    parsed.country,
    parsed.city,
    parsed.state
  );

  if (gyms.length === 0) {
    notFound();
  }

  const location = formatLocation(countryName, stateName, cityName);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fitnessdirectory.com";

  const breadcrumbItems = [
    { name: "Home", url: appUrl },
    { name: "Cities", url: `${appUrl}/cities` },
  ];

  if (stateName) {
    breadcrumbItems.push({
      name: countryName,
      url: `${appUrl}/cities/${encodeURIComponent(parsed.country)}`,
    });
    breadcrumbItems.push({
      name: stateName,
      url: `${appUrl}/cities/${encodeURIComponent(parsed.country)}/${encodeURIComponent(parsed.state!)}`,
    });
  } else {
    breadcrumbItems.push({
      name: countryName,
      url: `${appUrl}/cities/${encodeURIComponent(parsed.country)}`,
    });
  }
  breadcrumbItems.push({
    name: cityName,
    url: `${appUrl}/cities/${slug.join("/")}`,
  });

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Header />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900 dark:text-white">{location}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              Gyms in {location}
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {gyms.length} fitness {gyms.length === 1 ? "center" : "centers"} found
            </p>
          </header>

          {/* Gym Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gyms.map((gym) => (
              <Link
                key={gym.id}
                href={`/gym/${gym.slug}`}
                className="group rounded-xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-semibold text-zinc-900 group-hover:text-zinc-700 dark:text-white dark:group-hover:text-zinc-200">
                      {gym.name}
                    </h2>
                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                      {gym.address}
                    </p>
                  </div>
                  {gym.subscription_tier === "premium" && (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      Premium
                    </span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                    {gymTypeLabels[gym.gym_type] || gym.gym_type}
                  </span>
                  {gym.price_range && (
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                      {gym.price_range}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
              Own a gym in {cityName}?
            </h3>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Add your fitness center to the directory and reach more customers.
            </p>
            <Link
              href="/submit"
              className="mt-4 inline-block rounded-lg bg-zinc-900 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-100"
            >
              Submit Your Gym
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
