// Database types for Supabase
// These can be auto-generated using: npx supabase gen types typescript --local > src/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          role: Database["public"]["Enums"]["user_role"];
          favorite_centers: string[];
          alert_preferences: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          favorite_centers?: string[];
          alert_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          role?: Database["public"]["Enums"]["user_role"];
          favorite_centers?: string[];
          alert_preferences?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      fitness_centers: {
        Row: {
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
          hours: Json | null;
          price_range: Database["public"]["Enums"]["price_range"] | null;
          gym_type: Database["public"]["Enums"]["gym_type"];
          status: Database["public"]["Enums"]["gym_status"];
          owner_id: string | null;
          business_profile_id: string | null;
          subscription_tier: Database["public"]["Enums"]["subscription_tier"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          address: string;
          city: string;
          state?: string | null;
          country: string;
          postal_code?: string | null;
          latitude: number;
          longitude: number;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          hours?: Json | null;
          price_range?: Database["public"]["Enums"]["price_range"] | null;
          gym_type: Database["public"]["Enums"]["gym_type"];
          status?: Database["public"]["Enums"]["gym_status"];
          owner_id?: string | null;
          business_profile_id?: string | null;
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          address?: string;
          city?: string;
          state?: string | null;
          country?: string;
          postal_code?: string | null;
          latitude?: number;
          longitude?: number;
          phone?: string | null;
          email?: string | null;
          website?: string | null;
          hours?: Json | null;
          price_range?: Database["public"]["Enums"]["price_range"] | null;
          gym_type?: Database["public"]["Enums"]["gym_type"];
          status?: Database["public"]["Enums"]["gym_status"];
          owner_id?: string | null;
          business_profile_id?: string | null;
          subscription_tier?: Database["public"]["Enums"]["subscription_tier"];
          created_at?: string;
          updated_at?: string;
        };
      };
      fitness_center_details: {
        Row: {
          fitness_center_id: string;
          photos: string[];
          virtual_tour_url: string | null;
          class_schedule: Json | null;
          detailed_equipment_list: Json | null;
          staff_bios: Json | null;
          contract_terms: string | null;
          guest_policy: string | null;
          childcare_details: Json | null;
          recovery_services: Json | null;
          yelp_url: string | null;
          google_maps_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          fitness_center_id: string;
          photos?: string[];
          virtual_tour_url?: string | null;
          class_schedule?: Json | null;
          detailed_equipment_list?: Json | null;
          staff_bios?: Json | null;
          contract_terms?: string | null;
          guest_policy?: string | null;
          childcare_details?: Json | null;
          recovery_services?: Json | null;
          yelp_url?: string | null;
          google_maps_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          fitness_center_id?: string;
          photos?: string[];
          virtual_tour_url?: string | null;
          class_schedule?: Json | null;
          detailed_equipment_list?: Json | null;
          staff_bios?: Json | null;
          contract_terms?: string | null;
          guest_policy?: string | null;
          childcare_details?: Json | null;
          recovery_services?: Json | null;
          yelp_url?: string | null;
          google_maps_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      attributes: {
        Row: {
          id: string;
          name: string;
          slug: string;
          category: Database["public"]["Enums"]["attribute_category"];
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          category: Database["public"]["Enums"]["attribute_category"];
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          category?: Database["public"]["Enums"]["attribute_category"];
          icon?: string | null;
          created_at?: string;
        };
      };
      fitness_center_attributes: {
        Row: {
          id: string;
          fitness_center_id: string;
          attribute_id: string;
          value: string | null;
          quantity: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          fitness_center_id: string;
          attribute_id: string;
          value?: string | null;
          quantity?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          fitness_center_id?: string;
          attribute_id?: string;
          value?: string | null;
          quantity?: number | null;
          created_at?: string;
        };
      };
      premium_config: {
        Row: {
          id: string;
          field_name: string;
          field_type: Database["public"]["Enums"]["premium_field_type"];
          is_premium: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          field_name: string;
          field_type: Database["public"]["Enums"]["premium_field_type"];
          is_premium?: boolean;
          updated_at?: string;
        };
        Update: {
          id?: string;
          field_name?: string;
          field_type?: Database["public"]["Enums"]["premium_field_type"];
          is_premium?: boolean;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          fitness_center_id: string;
          stripe_subscription_id: string;
          status: Database["public"]["Enums"]["subscription_status"];
          current_period_end: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          fitness_center_id: string;
          stripe_subscription_id: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          current_period_end: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          fitness_center_id?: string;
          stripe_subscription_id?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          current_period_end?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          fitness_center_id: string | null;
          user_id: string;
          type: Database["public"]["Enums"]["submission_type"];
          is_owner: boolean;
          submitted_data: Json;
          verification_docs: string[];
          status: Database["public"]["Enums"]["submission_status"];
          admin_notes: string | null;
          submitted_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
        };
        Insert: {
          id?: string;
          fitness_center_id?: string | null;
          user_id: string;
          type: Database["public"]["Enums"]["submission_type"];
          is_owner?: boolean;
          submitted_data?: Json;
          verification_docs?: string[];
          status?: Database["public"]["Enums"]["submission_status"];
          admin_notes?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
        Update: {
          id?: string;
          fitness_center_id?: string | null;
          user_id?: string;
          type?: Database["public"]["Enums"]["submission_type"];
          is_owner?: boolean;
          submitted_data?: Json;
          verification_docs?: string[];
          status?: Database["public"]["Enums"]["submission_status"];
          admin_notes?: string | null;
          submitted_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
        };
      };
      business_profiles: {
        Row: {
          id: string;
          user_id: string;
          business_name: string;
          business_email: string | null;
          business_phone: string | null;
          business_address: string | null;
          business_city: string | null;
          business_state: string | null;
          business_country: string | null;
          business_postal_code: string | null;
          tax_id: string | null;
          website: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          business_name: string;
          business_email?: string | null;
          business_phone?: string | null;
          business_address?: string | null;
          business_city?: string | null;
          business_state?: string | null;
          business_country?: string | null;
          business_postal_code?: string | null;
          tax_id?: string | null;
          website?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          business_name?: string;
          business_email?: string | null;
          business_phone?: string | null;
          business_address?: string | null;
          business_city?: string | null;
          business_state?: string | null;
          business_country?: string | null;
          business_postal_code?: string | null;
          tax_id?: string | null;
          website?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_slug: {
        Args: { name: string; city: string };
        Returns: string;
      };
    };
    Enums: {
      subscription_tier: "free" | "premium";
      gym_status: "pending" | "verified" | "claimed" | "suspended";
      price_range: "$" | "$$" | "$$$" | "$$$$";
      gym_type:
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
      attribute_category:
        | "equipment"
        | "amenity"
        | "class"
        | "specialty"
        | "recovery";
      user_role: "user" | "owner" | "admin";
      submission_type: "claim" | "new_submission" | "suggestion";
      submission_status: "pending" | "approved" | "rejected" | "needs_info";
      subscription_status: "active" | "canceled" | "past_due";
      premium_field_type: "detail" | "attribute";
    };
  };
};

// Helper types for easier usage
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

// Convenience aliases
export type User = Tables<"users">;
export type FitnessCenter = Tables<"fitness_centers">;
export type FitnessCenterDetails = Tables<"fitness_center_details">;
export type Attribute = Tables<"attributes">;
export type FitnessCenterAttribute = Tables<"fitness_center_attributes">;
export type PremiumConfig = Tables<"premium_config">;
export type Subscription = Tables<"subscriptions">;
export type Submission = Tables<"submissions">;
export type BusinessProfile = Tables<"business_profiles">;
