import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { Header, Footer } from "@/components/layout";
import { BreadcrumbJsonLd } from "@/components/seo/json-ld";

interface AttributePageProps {
  params: Promise<{
    category: string;
    slug: string;
  }>;
}

interface GymListing {
  id: string;
  name: string;
  slug: string;
  city: string;
  country: string;
  gym_type: string;
  price_range: string | null;
  subscription_tier: string;
}

const validCategories = ["equipment", "amenity", "class", "specialty", "recovery"];

const categoryLabels: Record<string, string> = {
  equipment: "Equipment",
  amenity: "Amenities",
  class: "Classes",
  specialty: "Specialties",
  recovery: "Recovery",
};

const categoryDescriptions: Record<string, string> = {
  equipment: "fitness equipment",
  amenity: "this amenity",
  class: "this class type",
  specialty: "this specialty",
  recovery: "recovery services",
};

async function getAttributeGyms(
  category: string,
  slug: string
): Promise<{ gyms: GymListing[]; attributeName: string } | null> {
  const supabase = await createServerClient();

  // Get the attribute
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: attribute } = await (supabase as any)
    .from("attributes")
    .select("id, name")
    .eq("slug", slug)
    .eq("category", category)
    .single();

  if (!attribute) {
    return null;
  }

  // Get gyms with this attribute
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: attributeLinks } = await (supabase as any)
    .from("fitness_center_attributes")
    .select("fitness_center_id")
    .eq("attribute_id", attribute.id);

  if (!attributeLinks || attributeLinks.length === 0) {
    return { gyms: [], attributeName: attribute.name };
  }

  const gymIds = attributeLinks.map((l: { fitness_center_id: string }) => l.fitness_center_id);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: gyms } = await (supabase as any)
    .from("fitness_centers")
    .select("id, name, slug, city, country, gym_type, price_range, subscription_tier")
    .in("id", gymIds)
    .in("status", ["verified", "claimed"])
    .order("subscription_tier", { ascending: false })
    .order("name");

  return {
    gyms: (gyms || []) as GymListing[],
    attributeName: attribute.name,
  };
}

export async function generateMetadata({ params }: AttributePageProps): Promise<Metadata> {
  const { category, slug } = await params;

  if (!validCategories.includes(category)) {
    return { title: "Not Found" };
  }

  const result = await getAttributeGyms(category, slug);

  if (!result) {
    return { title: "Not Found" };
  }

  const categoryLabel = categoryLabels[category];

  return {
    title: `Gyms with ${result.attributeName} | Fitness Directory`,
    description: `Find gyms and fitness centers with ${result.attributeName}. Browse ${result.gyms.length} locations offering ${categoryDescriptions[category]}.`,
    openGraph: {
      title: `Gyms with ${result.attributeName}`,
      description: `Discover fitness centers with ${result.attributeName}`,
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

export default async function AttributePage({ params }: AttributePageProps) {
  const { category, slug } = await params;

  if (!validCategories.includes(category)) {
    notFound();
  }

  const result = await getAttributeGyms(category, slug);

  if (!result) {
    notFound();
  }

  const { gyms, attributeName } = result;

  if (gyms.length === 0) {
    notFound();
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fitnessdirectory.com";
  const categoryLabel = categoryLabels[category];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: appUrl },
          { name: categoryLabel, url: `${appUrl}/${category}` },
          { name: attributeName, url: `${appUrl}/${category}/${slug}` },
        ]}
      />
      <Header />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-300">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="capitalize">{categoryLabel}</span>
            <span className="mx-2">/</span>
            <span className="text-zinc-900 dark:text-white">{attributeName}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-zinc-200 px-3 py-1 text-sm font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {categoryLabel}
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-zinc-900 dark:text-white">
              Gyms with {attributeName}
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {gyms.length} fitness {gyms.length === 1 ? "center" : "centers"} with{" "}
              {attributeName.toLowerCase()}
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
                      {gym.city}, {gym.country}
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
              Does your gym have {attributeName.toLowerCase()}?
            </h3>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Add your fitness center to the directory and showcase your {categoryDescriptions[category]}.
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
