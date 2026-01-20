"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Enums } from "@/types/database";
import { toStateAbbreviation } from "@/lib/utils/states";

export type SubmissionResult = {
  error?: string;
  success?: boolean;
  submissionId?: string;
};

export interface SubmissionData {
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  gymType: Enums<"gym_type">;
  website?: string;
  phone?: string;
  email?: string;
  description?: string;
  priceRange?: Enums<"price_range">;
  isOwner: boolean;
  attributeIds?: string[];
}

// Geocode address using Google Maps Geocoding API
async function geocodeAddress(
  address: string,
  city: string,
  country: string
): Promise<{ latitude: number; longitude: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error("Google Maps API key not configured");
    return null;
  }

  try {
    const query = encodeURIComponent(`${address}, ${city}, ${country}`);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apiKey}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    if (data.status === "OK" && data.results?.length > 0) {
      const location = data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Generate a URL-friendly slug
function generateSlug(name: string, city: string): string {
  const base = `${name}-${city}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  // Add random suffix to ensure uniqueness
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}

export async function submitNewGym(
  data: SubmissionData
): Promise<SubmissionResult> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to submit a gym" };
  }

  // Validate required fields
  if (!data.name || !data.address || !data.city || !data.country || !data.gymType) {
    return { error: "Please fill in all required fields" };
  }

  // Geocode the address
  const coords = await geocodeAddress(data.address, data.city, data.country);

  if (!coords) {
    return {
      error:
        "Could not find the address. Please check the address and try again.",
    };
  }

  // Generate slug
  const slug = generateSlug(data.name, data.city);

  // Create the submission
  const submittedData = {
    name: data.name,
    address: data.address,
    city: data.city,
    state: toStateAbbreviation(data.state) || null,
    country: data.country,
    postal_code: data.postalCode || null,
    latitude: coords.latitude,
    longitude: coords.longitude,
    gym_type: data.gymType,
    website: data.website || null,
    phone: data.phone || null,
    email: data.email || null,
    description: data.description || null,
    price_range: data.priceRange || null,
    slug,
    attribute_ids: data.attributeIds || [],
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: submission, error } = await (supabase as any)
    .from("submissions")
    .insert({
      user_id: user.id,
      type: "new_submission",
      is_owner: data.isOwner,
      submitted_data: submittedData,
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Submission error:", error);
    return { error: "Failed to submit. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/owner");

  return { success: true, submissionId: submission.id };
}

export async function submitClaimRequest(
  fitnessCenterId: string,
  isOwner: boolean,
  verificationNotes?: string
): Promise<SubmissionResult> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to claim a listing" };
  }

  // Check if the fitness center exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: fitnessCenter, error: fcError } = await (supabase as any)
    .from("fitness_centers")
    .select("id, name, owner_id")
    .eq("id", fitnessCenterId)
    .single();

  if (fcError || !fitnessCenter) {
    return { error: "Fitness center not found" };
  }

  // Check if already claimed
  if (fitnessCenter.owner_id) {
    return { error: "This fitness center has already been claimed" };
  }

  // Check if user already has a pending claim for this gym
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingClaim } = await (supabase as any)
    .from("submissions")
    .select("id")
    .eq("user_id", user.id)
    .eq("fitness_center_id", fitnessCenterId)
    .eq("type", "claim")
    .eq("status", "pending")
    .single();

  if (existingClaim) {
    return { error: "You already have a pending claim for this fitness center" };
  }

  // Create the claim submission
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: submission, error } = await (supabase as any)
    .from("submissions")
    .insert({
      user_id: user.id,
      fitness_center_id: fitnessCenterId,
      type: "claim",
      is_owner: isOwner,
      submitted_data: {
        verification_notes: verificationNotes || null,
      },
      status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Claim submission error:", error);
    return { error: "Failed to submit claim. Please try again." };
  }

  revalidatePath("/dashboard");

  return { success: true, submissionId: submission.id };
}

export async function getAttributes() {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: attributes, error } = await (supabase as any)
    .from("attributes")
    .select("*")
    .order("category")
    .order("name");

  if (error) {
    console.error("Error fetching attributes:", error);
    return [];
  }

  return attributes;
}

export async function getUserSubmissions() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: submissions, error } = await (supabase as any)
    .from("submissions")
    .select("*")
    .eq("user_id", user.id)
    .order("submitted_at", { ascending: false });

  if (error) {
    console.error("Error fetching submissions:", error);
    return [];
  }

  return submissions;
}
