import type { CollectionCreateSchema } from "typesense/lib/Typesense/Collections";

export const COLLECTION_NAME = "fitness_centers";

// Typesense collection schema for fitness centers
export const fitnessCentersSchema: CollectionCreateSchema = {
  name: COLLECTION_NAME,
  fields: [
    // Core fields
    { name: "id", type: "string" },
    { name: "name", type: "string" },
    { name: "slug", type: "string" },
    { name: "description", type: "string", optional: true },

    // Location fields
    { name: "address", type: "string" },
    { name: "city", type: "string", facet: true },
    { name: "state", type: "string", optional: true, facet: true },
    { name: "country", type: "string", facet: true },
    { name: "postal_code", type: "string", optional: true },
    { name: "location", type: "geopoint" }, // [lat, lng]

    // Contact
    { name: "phone", type: "string", optional: true },
    { name: "website", type: "string", optional: true },

    // Classification
    { name: "gym_type", type: "string", facet: true },
    { name: "price_range", type: "string", optional: true, facet: true },

    // Hours
    { name: "is_24_hour", type: "bool", facet: true },
    { name: "hours_today", type: "string", optional: true },

    // Attributes (flattened for search)
    { name: "attributes", type: "string[]", facet: true },
    { name: "attribute_categories", type: "string[]", facet: true },

    // Equipment counts (for filtering)
    { name: "equipment_count", type: "int32", optional: true },
    { name: "amenity_count", type: "int32", optional: true },

    // Status & tier
    { name: "status", type: "string" },
    { name: "subscription_tier", type: "string", facet: true },

    // Sorting fields
    { name: "updated_at", type: "int64" },
    { name: "created_at", type: "int64" },

    // Premium boost score (premium listings rank higher)
    { name: "boost_score", type: "int32" },
  ],
  default_sorting_field: "boost_score",
  enable_nested_fields: false,
};

// Type for documents indexed in Typesense
export interface FitnessCenterDocument {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postal_code?: string;
  location: [number, number]; // [lat, lng]
  phone?: string;
  website?: string;
  gym_type: string;
  price_range?: string;
  is_24_hour: boolean;
  hours_today?: string;
  attributes: string[];
  attribute_categories: string[];
  equipment_count?: number;
  amenity_count?: number;
  status: string;
  subscription_tier: string;
  updated_at: number;
  created_at: number;
  boost_score: number;
}
