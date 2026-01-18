interface LocalBusinessJsonLdProps {
  name: string;
  description?: string;
  address: {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  phone?: string;
  email?: string;
  website?: string;
  priceRange?: string;
  hours?: Record<string, { open: string; close: string }>;
  url: string;
}

const dayMapping: Record<string, string> = {
  sunday: "Sunday",
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
};

export function LocalBusinessJsonLd({
  name,
  description,
  address,
  geo,
  phone,
  email,
  website,
  priceRange,
  hours,
  url,
}: LocalBusinessJsonLdProps) {
  const openingHours = hours
    ? Object.entries(hours)
        .filter(([, value]) => value?.open && value?.close)
        .map(([day, value]) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: dayMapping[day] || day,
          opens: value.open,
          closes: value.close,
        }))
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name,
    description,
    address: {
      "@type": "PostalAddress",
      streetAddress: address.street,
      addressLocality: address.city,
      addressRegion: address.state,
      addressCountry: address.country,
      postalCode: address.postalCode,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: geo.latitude,
      longitude: geo.longitude,
    },
    telephone: phone,
    email,
    url: website || url,
    priceRange,
    openingHoursSpecification: openingHours,
  };

  // Remove undefined values
  const cleanJsonLd = JSON.parse(
    JSON.stringify(jsonLd, (_, value) => (value === undefined ? undefined : value))
  );

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanJsonLd) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: Array<{
    name: string;
    url: string;
  }>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

interface WebsiteJsonLdProps {
  name: string;
  url: string;
  description: string;
}

export function WebsiteJsonLd({ name, url, description }: WebsiteJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
