// Supabase Edge Function: Sync fitness center changes to Typesense
// Triggered by database webhooks on fitness_centers table

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TYPESENSE_HOST = Deno.env.get("TYPESENSE_HOST")!;
const TYPESENSE_PORT = Deno.env.get("TYPESENSE_PORT") || "443";
const TYPESENSE_PROTOCOL = Deno.env.get("TYPESENSE_PROTOCOL") || "https";
const TYPESENSE_API_KEY = Deno.env.get("TYPESENSE_ADMIN_API_KEY")!;
const COLLECTION_NAME = "fitness_centers";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

interface WebhookPayload {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  record: Record<string, unknown> | null;
  old_record: Record<string, unknown> | null;
}

interface FitnessCenterRow {
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
  website: string | null;
  hours: Record<string, { open: string; close: string }> | null;
  gym_type: string;
  price_range: string | null;
  status: string;
  subscription_tier: string;
  created_at: string;
  updated_at: string;
}

async function typesenseRequest(
  method: string,
  path: string,
  body?: unknown
): Promise<Response> {
  const url = `${TYPESENSE_PROTOCOL}://${TYPESENSE_HOST}:${TYPESENSE_PORT}${path}`;

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-TYPESENSE-API-KEY": TYPESENSE_API_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return response;
}

function is24Hour(hours: Record<string, { open: string; close: string }> | null): boolean {
  if (!hours) return false;

  // Check if any day has 24-hour operation (00:00 to 23:59 or 24:00)
  return Object.values(hours).some(
    (day) =>
      day.open === "00:00" && (day.close === "23:59" || day.close === "24:00")
  );
}

function getTodayHours(hours: Record<string, { open: string; close: string }> | null): string | undefined {
  if (!hours) return undefined;

  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const today = days[new Date().getDay()];
  const todayHours = hours[today];

  if (!todayHours) return undefined;
  return `${todayHours.open} - ${todayHours.close}`;
}

async function buildDocument(
  record: FitnessCenterRow,
  supabase: ReturnType<typeof createClient>
): Promise<Record<string, unknown>> {
  // Fetch attributes for this fitness center
  const { data: fcAttributes } = await supabase
    .from("fitness_center_attributes")
    .select(`
      attribute_id,
      attributes (
        name,
        category
      )
    `)
    .eq("fitness_center_id", record.id);

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

  // Calculate boost score (premium listings get higher score)
  const boostScore = record.subscription_tier === "premium" ? 100 : 10;

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description || undefined,
    address: record.address,
    city: record.city,
    state: record.state || undefined,
    country: record.country,
    postal_code: record.postal_code || undefined,
    location: [record.latitude, record.longitude],
    phone: record.phone || undefined,
    website: record.website || undefined,
    gym_type: record.gym_type,
    price_range: record.price_range || undefined,
    is_24_hour: is24Hour(record.hours),
    hours_today: getTodayHours(record.hours),
    attributes,
    attribute_categories: attributeCategories,
    equipment_count: equipmentCount,
    amenity_count: amenityCount,
    status: record.status,
    subscription_tier: record.subscription_tier,
    updated_at: new Date(record.updated_at).getTime(),
    created_at: new Date(record.created_at).getTime(),
    boost_score: boostScore,
  };
}

serve(async (req) => {
  try {
    const payload: WebhookPayload = await req.json();
    const { type, record, old_record } = payload;

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log(`Processing ${type} event for fitness_centers`);

    if (type === "DELETE" && old_record) {
      // Delete document from Typesense
      const response = await typesenseRequest(
        "DELETE",
        `/collections/${COLLECTION_NAME}/documents/${old_record.id}`
      );

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete from Typesense: ${await response.text()}`);
      }

      console.log(`Deleted document ${old_record.id} from Typesense`);
    } else if ((type === "INSERT" || type === "UPDATE") && record) {
      const fcRecord = record as unknown as FitnessCenterRow;

      // Only index verified or claimed listings
      if (fcRecord.status !== "verified" && fcRecord.status !== "claimed") {
        // If updating to non-indexable status, remove from index
        if (type === "UPDATE") {
          await typesenseRequest(
            "DELETE",
            `/collections/${COLLECTION_NAME}/documents/${fcRecord.id}`
          );
          console.log(`Removed non-indexable document ${fcRecord.id} from Typesense`);
        }
        return new Response(JSON.stringify({ success: true, skipped: true }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      // Build and upsert document
      const document = await buildDocument(fcRecord, supabase);

      const response = await typesenseRequest(
        "POST",
        `/collections/${COLLECTION_NAME}/documents?action=upsert`,
        document
      );

      if (!response.ok) {
        throw new Error(`Failed to upsert to Typesense: ${await response.text()}`);
      }

      console.log(`Upserted document ${fcRecord.id} to Typesense`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
