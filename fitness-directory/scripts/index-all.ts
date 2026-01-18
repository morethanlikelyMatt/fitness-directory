/**
 * Script to bulk index all fitness centers to Typesense
 * Run with: npx tsx scripts/index-all.ts
 */

import { createClient } from "@supabase/supabase-js";
import { createAdminClient, COLLECTION_NAME } from "../src/lib/typesense";
import type { FitnessCenterDocument } from "../src/lib/typesense";
import type { Database } from "../src/types/database";

const BATCH_SIZE = 100;

async function indexAll() {
  // Initialize clients
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const typesense = createAdminClient();

  console.log("Starting bulk indexing to Typesense...\n");

  // Get total count
  const { count } = await supabase
    .from("fitness_centers")
    .select("*", { count: "exact", head: true })
    .in("status", ["verified", "claimed"]);

  console.log(`Found ${count} fitness centers to index.\n`);

  if (!count || count === 0) {
    console.log("No fitness centers to index.");
    return;
  }

  let indexed = 0;
  let offset = 0;

  while (offset < count) {
    // Fetch batch of fitness centers
    const { data: centers, error } = await supabase
      .from("fitness_centers")
      .select("*")
      .in("status", ["verified", "claimed"])
      .range(offset, offset + BATCH_SIZE - 1);

    if (error) {
      throw new Error(`Failed to fetch fitness centers: ${error.message}`);
    }

    if (!centers || centers.length === 0) {
      break;
    }

    // Transform to Typesense documents
    const documents: FitnessCenterDocument[] = await Promise.all(
      centers.map(async (center) => {
        const attributes: string[] = [];
        const attributeCategories: string[] = [];
        let equipmentCount = 0;
        let amenityCount = 0;

        // Fetch attributes for this center
        const { data: fcAttributes } = await supabase
          .from("fitness_center_attributes")
          .select(`
            attribute_id,
            attributes (
              name,
              category
            )
          `)
          .eq("fitness_center_id", center.id);

        if (fcAttributes) {
          for (const attr of fcAttributes) {
            const attrData = attr.attributes as unknown as { name: string; category: string } | null;
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

        const hours = center.hours as Record<string, { open: string; close: string }> | null;
        const is24Hour = hours
          ? Object.values(hours).some(
              (day) =>
                day.open === "00:00" && (day.close === "23:59" || day.close === "24:00")
            )
          : false;

        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const today = days[new Date().getDay()];
        const hoursToday = hours?.[today]
          ? `${hours[today].open} - ${hours[today].close}`
          : undefined;

        return {
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
          hours_today: hoursToday,
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
      })
    );

    // Import batch to Typesense
    try {
      const results = await typesense
        .collections(COLLECTION_NAME)
        .documents()
        .import(documents, { action: "upsert" });

      const successful = results.filter((r) => r.success).length;
      const failed = results.filter((r) => !r.success);

      indexed += successful;

      if (failed.length > 0) {
        console.warn(`  Warning: ${failed.length} documents failed to import:`);
        failed.slice(0, 3).forEach((f) => console.warn(`    - ${f.error}`));
      }
    } catch (error) {
      console.error(`Error importing batch:`, error);
      throw error;
    }

    console.log(`  Indexed ${indexed}/${count} (${Math.round((indexed / count) * 100)}%)`);
    offset += BATCH_SIZE;
  }

  console.log(`\n✓ Successfully indexed ${indexed} fitness centers!`);

  // Verify collection stats
  const collection = await typesense.collections(COLLECTION_NAME).retrieve();
  console.log(`\nCollection stats:`);
  console.log(`  Documents: ${collection.num_documents}`);
}

indexAll().catch((error) => {
  console.error("Error during bulk indexing:", error);
  process.exit(1);
});
