import { MetadataRoute } from "next";
import { createServerClient } from "@/lib/supabase";

interface GymSitemapEntry {
  slug: string;
  updated_at: string;
}

interface CityEntry {
  city: string;
  state: string | null;
  country: string;
}

interface AttributeEntry {
  attribute_id: string;
  attributes: { slug: string; category: string } | null;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://fitnessdirectory.com";
  const supabase = await createServerClient();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Get all published gyms
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: gymsData } = await (supabase as any)
    .from("fitness_centers")
    .select("slug, updated_at")
    .in("status", ["verified", "claimed"]);

  const gyms = (gymsData || []) as GymSitemapEntry[];

  const gymPages: MetadataRoute.Sitemap = gyms.map((gym) => ({
    url: `${baseUrl}/gym/${gym.slug}`,
    lastModified: new Date(gym.updated_at),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Get unique cities with at least 3 gyms
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: citiesData } = await (supabase as any)
    .from("fitness_centers")
    .select("city, state, country")
    .in("status", ["verified", "claimed"]);

  const cities = (citiesData || []) as CityEntry[];

  // Count gyms per city
  const cityCount: Record<string, { city: string; state: string | null; country: string; count: number }> = {};
  for (const gym of cities) {
    const key = `${gym.country}/${gym.state || "_"}/${gym.city}`.toLowerCase();
    if (!cityCount[key]) {
      cityCount[key] = { city: gym.city, state: gym.state, country: gym.country, count: 0 };
    }
    cityCount[key].count++;
  }

  const cityPages: MetadataRoute.Sitemap = Object.entries(cityCount)
    .filter(([, data]) => data.count >= 3)
    .map(([, data]) => {
      const path = data.state
        ? `/cities/${encodeURIComponent(data.country.toLowerCase())}/${encodeURIComponent(data.state.toLowerCase())}/${encodeURIComponent(data.city.toLowerCase())}`
        : `/cities/${encodeURIComponent(data.country.toLowerCase())}/${encodeURIComponent(data.city.toLowerCase())}`;
      return {
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });

  // Get attributes that are used by at least 3 gyms
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: attributeCountsData } = await (supabase as any)
    .from("fitness_center_attributes")
    .select("attribute_id, attributes(slug, category)");

  const attributeCounts = (attributeCountsData || []) as AttributeEntry[];

  const attrCount: Record<string, { slug: string; category: string; count: number }> = {};
  for (const item of attributeCounts) {
    if (!item.attributes) continue;
    const key = item.attributes.slug;
    if (!attrCount[key]) {
      attrCount[key] = { slug: item.attributes.slug, category: item.attributes.category, count: 0 };
    }
    attrCount[key].count++;
  }

  const attributePages: MetadataRoute.Sitemap = Object.entries(attrCount)
    .filter(([, data]) => data.count >= 3)
    .map(([, data]) => ({
      url: `${baseUrl}/${data.category}/${data.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  return [...staticPages, ...gymPages, ...cityPages, ...attributePages];
}
