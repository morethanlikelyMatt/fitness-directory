"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/auth";
import { indexFitnessCenter } from "@/lib/typesense";
import { toStateAbbreviation } from "@/lib/utils/states";

async function verifyAdmin() {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!data || data.role !== "admin") {
    throw new Error("Unauthorized");
  }

  return { supabase, adminId: user.id };
}

// Generate a unique slug by adding a random suffix if the base slug exists
async function generateUniqueSlug(supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never, baseSlug: string): Promise<string> {
  // Check if the slug already exists
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: existing } = await (supabase as any)
    .from("fitness_centers")
    .select("id")
    .eq("slug", baseSlug)
    .single();

  if (!existing) {
    return baseSlug;
  }

  // Slug exists, generate a new one with a random suffix
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${baseSlug}-${suffix}`;
}

export async function approveSubmission(id: string) {
  const { supabase, adminId } = await verifyAdmin();

  // Get the submission
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: submission, error: fetchError } = await (supabase as any)
    .from("submissions")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !submission) {
    return { error: "Submission not found" };
  }

  // Check if already approved
  if (submission.status === "approved") {
    return { error: "Submission has already been approved" };
  }

  if (submission.type === "new_submission") {
    // Create a new fitness center from the submission
    const data = submission.submitted_data as {
      name: string;
      slug: string;
      address: string;
      city: string;
      state?: string;
      country: string;
      postal_code?: string;
      latitude: number;
      longitude: number;
      gym_type: string;
      website?: string;
      phone?: string;
      email?: string;
      description?: string;
      price_range?: string;
      attribute_ids?: string[];
    };

    // Generate a unique slug in case the original one is taken
    const uniqueSlug = await generateUniqueSlug(supabase, data.slug);

    // Convert state name to abbreviation
    const stateAbbr = toStateAbbreviation(data.state);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: newListing, error: createError } = await (supabase as any)
      .from("fitness_centers")
      .insert({
        name: data.name,
        slug: uniqueSlug,
        address: data.address,
        city: data.city,
        state: stateAbbr,
        country: data.country,
        postal_code: data.postal_code,
        latitude: data.latitude,
        longitude: data.longitude,
        gym_type: data.gym_type,
        website: data.website,
        phone: data.phone,
        email: data.email,
        description: data.description,
        price_range: data.price_range,
        status: submission.is_owner ? "claimed" : "verified",
        owner_id: submission.is_owner ? submission.user_id : null,
      })
      .select("id")
      .single();

    if (createError) {
      console.error("Error creating listing:", createError);
      return { error: "Failed to create listing" };
    }

    // Index the new fitness center in Typesense for search
    await indexFitnessCenter(newListing.id);

    // Link the submission to the new fitness center
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any)
      .from("submissions")
      .update({ fitness_center_id: newListing.id })
      .eq("id", id);

    // Add attributes if provided
    if (data.attribute_ids && data.attribute_ids.length > 0) {
      const attributeInserts = data.attribute_ids.map((attrId: string) => ({
        fitness_center_id: newListing.id,
        attribute_id: attrId,
      }));

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("fitness_center_attributes")
        .insert(attributeInserts);
    }

    // Update the user role if they claimed ownership (but don't downgrade admins)
    if (submission.is_owner) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: submitterData } = await (supabase as any)
        .from("users")
        .select("role")
        .eq("id", submission.user_id)
        .single();

      if (submitterData?.role !== "admin") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any)
          .from("users")
          .update({ role: "owner" })
          .eq("id", submission.user_id);
      }
    }
  } else if (submission.type === "claim") {
    // Approve the claim - set owner_id on the fitness center
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: updateError } = await (supabase as any)
      .from("fitness_centers")
      .update({
        owner_id: submission.user_id,
        status: "claimed",
      })
      .eq("id", submission.fitness_center_id);

    if (updateError) {
      console.error("Error updating listing:", updateError);
      return { error: "Failed to approve claim" };
    }

    // Update user role to owner (but don't downgrade admins)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: claimantData } = await (supabase as any)
      .from("users")
      .select("role")
      .eq("id", submission.user_id)
      .single();

    if (claimantData?.role !== "admin") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("users")
        .update({ role: "owner" })
        .eq("id", submission.user_id);
    }
  }

  // Update submission status
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: updateError } = await (supabase as any)
    .from("submissions")
    .update({
      status: "approved",
    })
    .eq("id", id);

  if (updateError) {
    console.error("Error updating submission:", updateError);
    return { error: "Failed to update submission status" };
  }

  revalidatePath("/admin/submissions");
  revalidatePath("/admin");
  revalidatePath("/search");

  return { success: true };
}

export async function rejectSubmission(id: string, notes?: string) {
  const { supabase, adminId } = await verifyAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("submissions")
    .update({
      status: "rejected",
      admin_notes: notes || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error rejecting submission:", error);
    return { error: "Failed to reject submission" };
  }

  revalidatePath("/admin/submissions");
  revalidatePath("/admin");

  return { success: true };
}
