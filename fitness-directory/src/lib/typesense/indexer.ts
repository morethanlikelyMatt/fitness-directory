/**
 * Typesense indexing utilities for single document operations
 */

import { createAdminClient } from "./client";
import { COLLECTION_NAME, type FitnessCenterDocument } from "./schema";
import { createClient } from "@/lib/supabase/server";

/**
 * Index a single fitness center to Typesense
 * Call this when a gym is approved or updated
 */
export async function indexFitnessCenter(fitnessCenterId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const typesense = createAdminClient();

    // Fetch the fitness center with its attributes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: center, error } = await (supabase as any)
      .from("fitness_centers")
      .select("*")
      .eq("id", fitnessCenterId)
      .single();

    if (error || !center) {
      console.error("Error fetching fitness center for indexing:", error);
      return false;
    }

    // Only index verified or claimed gyms
    if (center.status !== "verified" && center.status !== "claimed") {
      console.log(`Skipping indexing for gym ${fitnessCenterId} with status ${center.status}`);
      return true;
    }

    // Fetch attributes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: fcAttributes } = await (supabase as any)
      .from("fitness_center_attributes")
      .select(`
        attribute_id,
        attributes (
          name,
          category
        )
      `)
      .eq("fitness_center_id", fitnessCenterId);

    const attributes: string[] = [];
    const attributeCategories: string[] = [];
    let equipmentCount = 0;
    let amenityCount = 0;

    if (fcAttributes) {
      for (const attr of fcAttributes) {
        const attrData = attr.attributes as { name: string; category: string } | null;
        if (attrData) {
          attributes.push(attrData.name);
          if (!attributeCategories.includes(attrData.category)) {
            attributeCategories.push(attrData.category);
          }
          if (attrData.category === "equipment") equipmentCount++;
          if (attrData.category === "amenity") amenityCount++;
        }
      }
    }

    // Parse hours for 24-hour detection
    const hours = center.hours as Record<string, { open: string; close: string }> | null;
    const is24Hour = hours
      ? Object.values(hours).some(
          (day) =>
            day.open === "00:00" && (day.close === "23:59" || day.close === "24:00")
        )
      : false;

    // Build the document
    const document: FitnessCenterDocument = {
      id: center.id,
      name: center.name,
      slug: center.slug,
      description: center.description || undefined,
      address: center.address,
      city: center.city,
      state: center.state || undefined,
      country: center.country,
      postal_code: center.postal_code || undefined,
      location: [center.latitude, center.longitude] as [number, number],
      phone: center.phone || undefined,
      website: center.website || undefined,
      gym_type: center.gym_type,
      price_range: center.price_range || undefined,
      is_24_hour: is24Hour,
      hours_today: undefined,
      attributes,
      attribute_categories: attributeCategories,
      equipment_count: equipmentCount,
      amenity_count: amenityCount,
      status: center.status,
      subscription_tier: center.subscription_tier,
      updated_at: new Date(center.updated_at).getTime(),
      created_at: new Date(center.created_at).getTime(),
      boost_score: center.subscription_tier === "premium" ? 100 : 10,
    };

    // Upsert to Typesense
    await typesense
      .collections(COLLECTION_NAME)
      .documents()
      .upsert(document);

    console.log(`Successfully indexed fitness center ${fitnessCenterId} to Typesense`);
    return true;
  } catch (error) {
    console.error("Error indexing fitness center to Typesense:", error);
    return false;
  }
}

/**
 * Remove a fitness center from Typesense index
 * Call this when a gym is deleted or suspended
 */
export async function removeFromIndex(fitnessCenterId: string): Promise<boolean> {
  try {
    const typesense = createAdminClient();

    await typesense
      .collections(COLLECTION_NAME)
      .documents(fitnessCenterId)
      .delete();

    console.log(`Successfully removed fitness center ${fitnessCenterId} from Typesense`);
    return true;
  } catch (error) {
    // Ignore "not found" errors
    if ((error as Error).message?.includes("not found")) {
      return true;
    }
    console.error("Error removing fitness center from Typesense:", error);
    return false;
  }
}
