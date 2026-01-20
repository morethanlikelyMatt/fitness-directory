import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createServerClient } from "@/lib/supabase";
import { Header, Footer } from "@/components/layout";
import { LocalBusinessJsonLd, BreadcrumbJsonLd } from "@/components/seo/json-ld";
import { ExternalRatings } from "@/components/ratings/external-ratings";

interface GymPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Gym data type from Supabase query
interface GymData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string | null;
  country: string;
  postal_code: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: unknown;
  price_range: string | null;
  gym_type: string;
  status: string;
  owner_id: string | null;
  subscription_tier: string;
  fitness_center_details: unknown;
  fitness_center_attributes: Array<{
    value: string | null;
    quantity: number | null;
    attributes: unknown;
  }>;
}

// Fetch gym data
async function getGym(slug: string): Promise<GymData | null> {
  const supabase = await createServerClient();

  const { data: gym, error } = await supabase
    .from("fitness_centers")
    .select(
      `
      *,
      fitness_center_details (*),
      fitness_center_attributes (
        value,
        quantity,
        attributes (
          name,
          slug,
          category,
          icon
        )
      )
    `
    )
    .eq("slug", slug)
    .in("status", ["verified", "claimed"])
    .single();

  if (error || !gym) {
    return null;
  }

  return gym as unknown as GymData;
}

export async function generateMetadata({
  params,
}: GymPageProps): Promise<Metadata> {
  const { slug } = await params;
  const gym = await getGym(slug);

  if (!gym) {
    return {
      title: "Gym Not Found",
    };
  }

  const locationParts = [gym.city, gym.state, gym.country].filter(Boolean) as string[];

  return {
    title: gym.name,
    description:
      gym.description ||
      `${gym.name} is a ${gymTypeLabels[gym.gym_type as string] || gym.gym_type} in ${locationParts.join(", ")}. View hours, equipment, amenities, and more.`,
    openGraph: {
      title: gym.name,
      description:
        gym.description ||
        `Find equipment, hours, and amenities at ${gym.name}`,
      type: "website",
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
  rehab: "Rehab/Physical Therapy Center",
  university: "University Gym",
  hotel: "Hotel Gym",
  community: "Community Center",
};

const dayNames = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

const dayLabels: Record<string, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

export default async function GymPage({ params }: GymPageProps) {
  const { slug } = await params;
  const gym = await getGym(slug);

  if (!gym) {
    notFound();
  }

  const isPremium = gym.subscription_tier === "premium";
  const locationParts = [gym.city, gym.state, gym.country].filter(Boolean);
  const hours = gym.hours as Record<string, { open: string; close: string }> | null;
  const details = gym.fitness_center_details as {
    photos?: string[];
    virtual_tour_url?: string;
    contract_terms?: string;
    guest_policy?: string;
    yelp_url?: string;
    google_maps_url?: string;
  } | null;

  // Group attributes by category
  const attributesByCategory: Record<
    string,
    Array<{ name: string; value?: string; quantity?: number }>
  > = {};

  if (gym.fitness_center_attributes) {
    for (const attr of gym.fitness_center_attributes) {
      const attrData = attr.attributes as {
        name: string;
        category: string;
      } | null;
      if (attrData) {
        if (!attributesByCategory[attrData.category]) {
          attributesByCategory[attrData.category] = [];
        }
        attributesByCategory[attrData.category].push({
          name: attrData.name,
          value: attr.value || undefined,
          quantity: attr.quantity || undefined,
        });
      }
    }
  }

  const categoryLabels: Record<string, string> = {
    equipment: "Equipment",
    amenity: "Amenities",
    class: "Classes",
    specialty: "Specialties",
    recovery: "Recovery",
  };

  const categoryOrder = ["equipment", "amenity", "class", "specialty", "recovery"];

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fitnessdirectory.com";

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Structured Data */}
      <LocalBusinessJsonLd
        name={gym.name}
        description={gym.description || undefined}
        address={{
          street: gym.address,
          city: gym.city,
          state: gym.state || undefined,
          country: gym.country,
          postalCode: gym.postal_code || undefined,
        }}
        geo={{
          latitude: gym.latitude,
          longitude: gym.longitude,
        }}
        phone={gym.phone || undefined}
        email={gym.email || undefined}
        website={gym.website || undefined}
        priceRange={gym.price_range || undefined}
        hours={hours || undefined}
        url={`${appUrl}/gym/${gym.slug}`}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: appUrl },
          { name: "Search", url: `${appUrl}/search` },
          { name: gym.name, url: `${appUrl}/gym/${gym.slug}` },
        ]}
      />

      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-6 py-8">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-zinc-500">
            <Link href="/" className="hover:text-zinc-700:text-zinc-300">
              Home
            </Link>
            <span className="mx-2">/</span>
            <Link
              href="/search"
              className="hover:text-zinc-700:text-zinc-300"
            >
              Search
            </Link>
            <span className="mx-2">/</span>
            <span className="text-zinc-900">{gym.name}</span>
          </nav>

          {/* Header */}
          <header className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                {isPremium && (
                  <span className="mb-2 inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                    Premium Listing
                  </span>
                )}
                <h1 className="text-3xl font-bold text-zinc-900">
                  {gym.name}
                </h1>
                <p className="mt-2 text-zinc-600">
                  {gym.address}
                  <br />
                  {locationParts.join(", ")}
                  {gym.postal_code && ` ${gym.postal_code}`}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
                {gymTypeLabels[gym.gym_type] || gym.gym_type}
              </span>
              {gym.price_range && (
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-700">
                  {gym.price_range}
                </span>
              )}
            </div>
          </header>

          {/* Content Grid */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="space-y-8 lg:col-span-2">
              {/* Description */}
              {gym.description && (
                <section>
                  <h2 className="text-xl font-semibold text-zinc-900">
                    About
                  </h2>
                  <p className="mt-4 whitespace-pre-line text-zinc-600">
                    {gym.description}
                  </p>
                </section>
              )}

              {/* Attributes by Category */}
              {categoryOrder.map((category) => {
                const attrs = attributesByCategory[category];
                if (!attrs || attrs.length === 0) return null;

                return (
                  <section key={category}>
                    <h2 className="text-xl font-semibold text-zinc-900">
                      {categoryLabels[category] || category}
                    </h2>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {attrs.map((attr, idx) => (
                        <span
                          key={idx}
                          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-sm text-zinc-700"
                        >
                          {attr.name}
                          {isPremium && attr.quantity && (
                            <span className="ml-1 text-zinc-500">
                              ({attr.quantity})
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </section>
                );
              })}

              {/* Premium Content */}
              {isPremium && details?.guest_policy && (
                <section>
                  <h2 className="text-xl font-semibold text-zinc-900">
                    Guest Policy
                  </h2>
                  <p className="mt-4 text-zinc-600">
                    {details.guest_policy}
                  </p>
                </section>
              )}

              {isPremium && details?.contract_terms && (
                <section>
                  <h2 className="text-xl font-semibold text-zinc-900">
                    Contract & Membership
                  </h2>
                  <p className="mt-4 text-zinc-600">
                    {details.contract_terms}
                  </p>
                </section>
              )}

              {/* Non-premium upsell */}
              {!isPremium && (
                <section className="rounded-lg border border-dashed border-zinc-300 bg-zinc-50 p-6">
                  <h3 className="font-semibold text-zinc-900">
                    Want more details?
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600">
                    Premium listings include photos, class schedules, detailed
                    equipment lists, contract terms, and more.
                  </p>
                  <p className="mt-4 text-sm text-zinc-500">
                    Are you the owner?{" "}
                    <Link
                      href="/submit"
                      className="font-medium text-zinc-900 hover:underline"
                    >
                      Claim this listing →
                    </Link>
                  </p>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-4 lg:col-span-1">
              {/* Hours */}
              <div className="rounded-lg border border-zinc-200 p-6">
                <h3 className="font-semibold text-zinc-900">
                  Hours
                </h3>
                {hours ? (
                  <div className="mt-4 space-y-2 text-sm">
                    {dayNames.map((day) => {
                      const dayHours = hours[day];
                      const isToday = dayNames[new Date().getDay()] === day;
                      return (
                        <div
                          key={day}
                          className={`flex justify-between ${
                            isToday ? "font-medium" : ""
                          }`}
                        >
                          <span
                            className={
                              isToday
                                ? "text-zinc-900"
                                : "text-zinc-600"
                            }
                          >
                            {dayLabels[day]}
                            {isToday && " (Today)"}
                          </span>
                          <span
                            className={
                              isToday
                                ? "text-zinc-900"
                                : "text-zinc-600"
                            }
                          >
                            {dayHours
                              ? `${dayHours.open} - ${dayHours.close}`
                              : "Closed"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-zinc-500">
                    Hours not available
                  </p>
                )}
              </div>

              {/* Contact */}
              <div className="rounded-lg border border-zinc-200 p-6">
                <h3 className="font-semibold text-zinc-900">
                  Contact
                </h3>
                <div className="mt-4 space-y-3 text-sm">
                  {gym.phone && (
                    <p>
                      <a
                        href={`tel:${gym.phone}`}
                        className="text-zinc-600 hover:text-zinc-900:text-white"
                      >
                        {gym.phone}
                      </a>
                    </p>
                  )}
                  {gym.email && (
                    <p>
                      <a
                        href={`mailto:${gym.email}`}
                        className="text-zinc-600 hover:text-zinc-900:text-white"
                      >
                        {gym.email}
                      </a>
                    </p>
                  )}
                  {gym.website && (
                    <p>
                      <a
                        href={gym.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-900 hover:underline"
                      >
                        Visit Website →
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {/* External Ratings */}
              <ExternalRatings
                yelpUrl={details?.yelp_url}
                googleMapsUrl={details?.google_maps_url}
              />

              {/* Map Placeholder */}
              <div className="aspect-video rounded-lg border border-zinc-200 bg-zinc-100">
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  Map coming soon
                </div>
              </div>

              {/* Claim CTA */}
              {!gym.owner_id && (
                <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center">
                  <p className="text-sm text-zinc-600">
                    Is this your gym?
                  </p>
                  <Link
                    href="/submit"
                    className="mt-2 inline-block text-sm font-medium text-zinc-900 hover:underline"
                  >
                    Claim this listing →
                  </Link>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
