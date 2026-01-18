// Core domain types for Fitness Directory
// Re-export database types for convenience
export type {
  Database,
  Json,
  Tables,
  TablesInsert,
  TablesUpdate,
  Enums,
  User,
  FitnessCenter,
  FitnessCenterDetails,
  Attribute,
  FitnessCenterAttribute,
  PremiumConfig,
  Subscription,
  Submission,
} from "./database";

// Enum type aliases for convenience
export type SubscriptionTier = "free" | "premium";
export type GymStatus = "pending" | "verified" | "claimed" | "suspended";
export type PriceRange = "$" | "$$" | "$$$" | "$$$$";
export type GymType =
  | "commercial"
  | "boutique"
  | "crossfit"
  | "powerlifting"
  | "24hour"
  | "womens"
  | "rehab"
  | "university"
  | "hotel"
  | "community";
export type AttributeCategory =
  | "equipment"
  | "amenity"
  | "class"
  | "specialty"
  | "recovery";
export type UserRole = "user" | "owner" | "admin";
export type SubmissionType = "claim" | "new_submission" | "suggestion";
export type SubmissionStatus = "pending" | "approved" | "rejected" | "needs_info";
export type SubscriptionStatus = "active" | "canceled" | "past_due";

// Search-related types (not in database, used for API/UI)
export interface SearchFilters {
  query?: string;
  location?: {
    lat: number;
    lng: number;
    radius: number; // in miles
  };
  gym_type?: GymType[];
  price_range?: PriceRange[];
  attributes?: string[];
  is_24_hour?: boolean;
}

export interface SearchResult {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  city: string;
  state: string | null;
  country: string;
  gym_type: GymType;
  price_range: PriceRange | null;
  subscription_tier: SubscriptionTier;
  attributes: string[];
  distance?: number; // in miles, when geo search is used
}

export interface PaginatedResults<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
