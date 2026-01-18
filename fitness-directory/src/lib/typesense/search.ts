import { createSearchClient } from "./client";
import { COLLECTION_NAME, type FitnessCenterDocument } from "./schema";
import type { SearchResponse as TypesenseSearchResponse } from "typesense/lib/Typesense/Documents";

export interface SearchParams {
  query: string;
  page?: number;
  perPage?: number;
  // Geo search
  location?: {
    lat: number;
    lng: number;
    radiusMiles: number;
  };
  // Filters
  gymTypes?: string[];
  priceRanges?: string[];
  attributes?: string[];
  cities?: string[];
  countries?: string[];
  is24Hour?: boolean;
  subscriptionTier?: "free" | "premium";
  // Sorting
  sortBy?: "relevance" | "distance" | "newest" | "name";
}

export interface SearchResultItem extends FitnessCenterDocument {
  distance?: number; // Distance in miles (from geo search)
}

export interface SearchResponse {
  results: SearchResultItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
  facets: {
    gymTypes: FacetCount[];
    priceRanges: FacetCount[];
    attributes: FacetCount[];
    cities: FacetCount[];
    countries: FacetCount[];
  };
  processingTimeMs: number;
}

interface FacetCount {
  value: string;
  count: number;
}

// Common terms that are meaningless in gym search context
const STOPWORDS = new Set([
  "gym", "gyms", "fitness", "center", "centers", "centre", "centres",
  "club", "clubs", "studio", "studios", "facility", "facilities",
  "with", "and", "or", "the", "a", "an", "in", "near", "nearby",
  "find", "search", "looking", "for", "that", "has", "have", "having"
]);

// Geocode a location using Google Maps Geocoding API
async function geocodeLocation(query: string): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.warn("Google Maps API key not configured");
    return null;
  }

  try {
    const encoded = encodeURIComponent(query + ", USA");
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encoded}&key=${apiKey}`,
      {
        next: { revalidate: 86400 }, // Cache for 24 hours
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.status === "OK" && data.results?.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    }
  } catch (error) {
    console.error("Geocoding error:", error);
  }
  return null;
}

// Known cities/locations - add more as needed
const KNOWN_LOCATIONS = new Map<string, string>([
  // Cities (lowercase -> proper case for filter)
  ["austin", "Austin"],
  ["austin tx", "Austin"],
  ["austin, tx", "Austin"],
  ["miami", "Miami"],
  ["miami fl", "Miami"],
  ["miami, fl", "Miami"],
  ["new york", "New York"],
  ["new york city", "New York"],
  ["new york, ny", "New York"],
  ["nyc", "New York"],
  ["manhattan", "New York"],
  ["brooklyn", "Brooklyn"],
  ["brooklyn, ny", "Brooklyn"],
  ["los angeles", "Los Angeles"],
  ["los angeles, ca", "Los Angeles"],
  ["la", "Los Angeles"],
  ["chicago", "Chicago"],
  ["chicago, il", "Chicago"],
  ["houston", "Houston"],
  ["houston, tx", "Houston"],
  ["phoenix", "Phoenix"],
  ["dallas", "Dallas"],
  ["san antonio", "San Antonio"],
  ["san diego", "San Diego"],
  ["san jose", "San Jose"],
  ["san francisco", "San Francisco"],
  ["sf", "San Francisco"],
  ["denver", "Denver"],
  ["denver, co", "Denver"],
  ["seattle", "Seattle"],
  ["seattle, wa", "Seattle"],
  ["boston", "Boston"],
  ["boston, ma", "Boston"],
  ["atlanta", "Atlanta"],
  ["atlanta, ga", "Atlanta"],
  ["portland", "Portland"],
  ["nashville", "Nashville"],
  ["miami beach", "Miami Beach"],
  ["miami beach, fl", "Miami Beach"],
]);

// Normalize a city name from user input to database format
// Returns { city, isConfident } where isConfident means we found an exact match in our gym database
function normalizeCity(input: string): {
  city: string;
  isConfident: boolean;
} {
  const normalized = input.toLowerCase().trim();

  // Check exact match first
  if (KNOWN_LOCATIONS.has(normalized)) {
    return {
      city: KNOWN_LOCATIONS.get(normalized)!,
      isConfident: true,
    };
  }

  // Check if the normalized input starts with any known location key
  // This handles "austin, tx" matching "austin" but avoids "staten island" matching "la"
  // Sort by length descending to match longer keys first (e.g., "miami beach" before "miami")
  const sortedEntries = Array.from(KNOWN_LOCATIONS.entries())
    .sort((a, b) => b[0].length - a[0].length);

  for (const [key, value] of sortedEntries) {
    // Only match if key appears at start or as a complete word
    if (normalized.startsWith(key + ",") ||
        normalized.startsWith(key + " ") ||
        normalized === key) {
      return {
        city: value,
        isConfident: true,
      };
    }
  }

  // Clean up the input
  const cleaned = input.split(",")[0].trim().split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return { city: cleaned, isConfident: false };
}

interface ParsedQuery {
  searchTerms: string;
  locationFilters: string[];
}

function parseQuery(query: string): ParsedQuery {
  const lowerQuery = query.toLowerCase();
  const locationFilters: string[] = [];
  let remainingQuery = lowerQuery;

  // Check for multi-word locations first (e.g., "miami beach", "new york")
  const sortedLocations = Array.from(KNOWN_LOCATIONS.entries())
    .sort((a, b) => b[0].length - a[0].length); // Sort by length descending

  for (const [locationKey, locationValue] of sortedLocations) {
    if (remainingQuery.includes(locationKey)) {
      locationFilters.push(locationValue);
      // Remove the location from the query
      remainingQuery = remainingQuery.replace(new RegExp(locationKey, 'g'), ' ');
    }
  }

  // Clean up the remaining query (remove stopwords and extra spaces)
  const words = remainingQuery.split(/\s+/).filter(word => word && !STOPWORDS.has(word));
  const searchTerms = words.join(" ");

  return {
    searchTerms,
    locationFilters,
  };
}

function cleanQuery(query: string): string {
  const words = query.toLowerCase().split(/\s+/);
  const filtered = words.filter(word => !STOPWORDS.has(word));
  // If all words were stopwords, return original query
  return filtered.length > 0 ? filtered.join(" ") : query;
}

export async function searchFitnessCenters(
  params: SearchParams
): Promise<SearchResponse> {
  const client = createSearchClient();
  const {
    query: rawQuery,
    page = 1,
    perPage = 20,
    location,
    gymTypes,
    priceRanges,
    attributes,
    cities,
    countries,
    is24Hour,
    subscriptionTier,
    sortBy = "relevance",
  } = params;

  // If explicit cities are provided (from location picker), normalize and use them
  // Otherwise, parse the query to extract location filters
  let query: string;
  let cityFilters: string[] = [];
  let proximityLocation: { lat: number; lng: number } | undefined;

  if (cities?.length) {
    // Explicit city filter provided - normalize city names
    query = rawQuery ? cleanQuery(rawQuery) : "";
    for (const c of cities) {
      const normalized = normalizeCity(c);
      if (normalized.isConfident) {
        cityFilters.push(normalized.city);
      } else {
        // Not in our database - geocode the location for proximity search
        const coords = await geocodeLocation(c);
        if (coords) {
          proximityLocation = coords;
        }
      }
    }
  } else {
    // No explicit city - extract locations from query
    const parsed = rawQuery
      ? parseQuery(rawQuery)
      : { searchTerms: "", locationFilters: [] };
    query = parsed.searchTerms;
    cityFilters = parsed.locationFilters;
  }

  // Build effective query
  let effectiveQuery = query;
  if (!query && cityFilters.length > 0) {
    // If no search term but have city filters, use city as query for text matching
    effectiveQuery = cityFilters.join(" ");
  }

  // Build filter string
  const filters: string[] = [];

  // Only show verified/claimed listings
  filters.push("status:[verified, claimed]");

  if (gymTypes?.length) {
    filters.push(`gym_type:[${gymTypes.join(",")}]`);
  }

  if (priceRanges?.length) {
    filters.push(`price_range:[${priceRanges.join(",")}]`);
  }

  if (attributes?.length) {
    filters.push(`attributes:[${attributes.join(",")}]`);
  }

  // Use city filters (either explicit or extracted from query)
  if (cityFilters.length) {
    filters.push(`city:[${cityFilters.join(",")}]`);
  }

  if (countries?.length) {
    filters.push(`country:[${countries.join(",")}]`);
  }

  if (is24Hour !== undefined) {
    filters.push(`is_24_hour:${is24Hour}`);
  }

  if (subscriptionTier) {
    filters.push(`subscription_tier:${subscriptionTier}`);
  }

  // Proximity search - when user searches for a location we don't have gyms in
  // find gyms within 50 miles of that location
  if (proximityLocation && !cityFilters.length) {
    const radiusKm = 80; // ~50 miles
    filters.push(
      `location:(${proximityLocation.lat}, ${proximityLocation.lng}, ${radiusKm} km)`
    );
  }

  // Geo filter (explicit)
  if (location) {
    const radiusKm = location.radiusMiles * 1.60934;
    filters.push(
      `location:(${location.lat}, ${location.lng}, ${radiusKm} km)`
    );
  }

  // Build sort string
  let sortByStr: string;
  switch (sortBy) {
    case "distance":
      if (location) {
        sortByStr = `location(${location.lat}, ${location.lng}):asc`;
      } else {
        sortByStr = "_text_match:desc,boost_score:desc";
      }
      break;
    case "newest":
      sortByStr = "created_at:desc";
      break;
    case "name":
      sortByStr = "name:asc";
      break;
    case "relevance":
    default:
      sortByStr = "_text_match:desc,boost_score:desc";
  }

  // Use effective query - if user provided location but no search term,
  // use the city name as the query to get results from that area
  const finalQuery = effectiveQuery || "*";

  const searchParameters = {
    q: finalQuery,
    query_by: "name,description,address,city,attributes,gym_type",
    query_by_weights: "5,3,2,4,4,3", // Prioritize name and city for location searches
    filter_by: filters.join(" && "),
    sort_by: sortByStr,
    page,
    per_page: perPage,
    facet_by: "gym_type,price_range,attributes,city,country",
    max_facet_values: 50,
    // Use exhaustive search and allow dropping all tokens for flexible matching
    drop_tokens_threshold: 0,
    num_typos: 2,
    exhaustive_search: true,
  };

  const response = (await client
    .collections(COLLECTION_NAME)
    .documents()
    .search(searchParameters)) as TypesenseSearchResponse<FitnessCenterDocument>;

  // Parse facets
  const facetCounts = response.facet_counts || [];
  const getFacet = (name: string): FacetCount[] => {
    const facet = facetCounts.find((f) => f.field_name === name);
    return (
      facet?.counts?.map((c) => ({
        value: String(c.value),
        count: c.count,
      })) || []
    );
  };

  // Map results with distance if available
  const results: SearchResultItem[] =
    response.hits?.map((hit) => {
      const doc = hit.document;
      // Convert geo_distance_meters to miles
      const geoDistance = (hit as unknown as { geo_distance_meters?: { location: number } })
        .geo_distance_meters;
      const distanceMiles = geoDistance?.location
        ? geoDistance.location / 1609.34
        : undefined;

      return {
        ...doc,
        distance: distanceMiles,
      };
    }) || [];

  return {
    results,
    total: response.found || 0,
    page,
    perPage,
    totalPages: Math.ceil((response.found || 0) / perPage),
    facets: {
      gymTypes: getFacet("gym_type"),
      priceRanges: getFacet("price_range"),
      attributes: getFacet("attributes"),
      cities: getFacet("city"),
      countries: getFacet("country"),
    },
    processingTimeMs: response.search_time_ms || 0,
  };
}

// Autocomplete search for search bar suggestions
export async function autocompleteFitnessCenters(
  query: string,
  limit: number = 5
): Promise<{ id: string; name: string; city: string; slug: string }[]> {
  if (!query || query.length < 2) {
    return [];
  }

  const client = createSearchClient();

  const response = (await client
    .collections(COLLECTION_NAME)
    .documents()
    .search({
      q: query,
      query_by: "name,city",
      filter_by: "status:[verified, claimed]",
      per_page: limit,
      prefix: true,
    })) as TypesenseSearchResponse<FitnessCenterDocument>;

  return (
    response.hits?.map((hit) => ({
      id: hit.document.id,
      name: hit.document.name,
      city: hit.document.city,
      slug: hit.document.slug,
    })) || []
  );
}
