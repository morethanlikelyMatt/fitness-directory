"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Enums, Json, TablesUpdate } from "@/types/database";

export type ListingResult = {
  error?: string;
  success?: boolean;
};

export interface ListingUpdateData {
  name: string;
  description?: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  website?: string;
  gymType: Enums<"gym_type">;
  priceRange?: Enums<"price_range">;
  hours?: Record<string, { open: string; close: string }>;
  attributeIds: string[];
}

export async function getListing(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get the fitness center with its details and attributes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: listing, error } = await (supabase as any)
    .from("fitness_centers")
    .select(
      `
      *,
      fitness_center_details (*),
      fitness_center_attributes (
        attribute_id,
        value,
        quantity
      )
    `
    )
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (error || !listing) {
    return null;
  }

  return listing;
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

export async function updateListing(
  id: string,
  data: ListingUpdateData
): Promise<ListingResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to update a listing" };
  }

  // Check ownership
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existingData, error: fetchError } = await (supabase as any)
    .from("fitness_centers")
    .select("id, owner_id, slug")
    .eq("id", id)
    .single();

  if (fetchError || !existingData) {
    return { error: "Listing not found" };
  }

  const existing = existingData as { id: string; owner_id: string | null; slug: string };

  if (existing.owner_id !== user.id) {
    return { error: "You do not have permission to edit this listing" };
  }

  // Update the fitness center
  const updateData: TablesUpdate<"fitness_centers"> = {
    name: data.name,
    description: data.description || null,
    address: data.address,
    city: data.city,
    state: data.state || null,
    country: data.country,
    postal_code: data.postalCode || null,
    phone: data.phone || null,
    email: data.email || null,
    website: data.website || null,
    gym_type: data.gymType,
    price_range: data.priceRange || null,
    hours: (data.hours as Json) || null,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from("fitness_centers")
    .update(updateData)
    .eq("id", id);

  if (updateError) {
    console.error("Error updating listing:", updateError);
    return { error: "Failed to update listing. Please try again." };
  }

  // Update attributes - first delete existing ones
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("fitness_center_attributes")
    .delete()
    .eq("fitness_center_id", id);

  // Then insert new ones
  if (data.attributeIds.length > 0) {
    const attributeInserts = data.attributeIds.map((attributeId) => ({
      fitness_center_id: id,
      attribute_id: attributeId,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: attrError } = await (supabase as any)
      .from("fitness_center_attributes")
      .insert(attributeInserts);

    if (attrError) {
      console.error("Error updating attributes:", attrError);
      // Don't fail the whole operation for attribute errors
    }
  }

  revalidatePath(`/owner/listings/${id}/edit`);
  revalidatePath("/owner");
  revalidatePath(`/gym/${existing.slug}`);

  return { success: true };
}

export async function deleteListing(id: string): Promise<ListingResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in to delete a listing" };
  }

  // Check ownership
  const { data: existingData, error: fetchError } = await supabase
    .from("fitness_centers")
    .select("id, owner_id")
    .eq("id", id)
    .single();

  if (fetchError || !existingData) {
    return { error: "Listing not found" };
  }

  const existing = existingData as { id: string; owner_id: string | null };

  if (existing.owner_id !== user.id) {
    return { error: "You do not have permission to delete this listing" };
  }

  // Delete the listing (cascades to details and attributes)
  const supabaseForDelete = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabaseForDelete as any).from("fitness_centers").delete().eq("id", id);

  if (error) {
    console.error("Error deleting listing:", error);
    return { error: "Failed to delete listing. Please try again." };
  }

  revalidatePath("/owner");
  revalidatePath("/search");

  return { success: true };
}
