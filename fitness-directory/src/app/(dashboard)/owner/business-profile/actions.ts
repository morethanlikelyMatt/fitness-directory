"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveBusinessProfile(
  formData: FormData,
  userId: string,
  existingProfileId?: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const businessName = formData.get("business_name") as string;

  if (!businessName?.trim()) {
    return { error: "Business name is required" };
  }

  const profileData = {
    user_id: userId,
    business_name: businessName.trim(),
    business_email: (formData.get("business_email") as string)?.trim() || null,
    business_phone: (formData.get("business_phone") as string)?.trim() || null,
    website: (formData.get("website") as string)?.trim() || null,
    business_address: (formData.get("business_address") as string)?.trim() || null,
    business_city: (formData.get("business_city") as string)?.trim() || null,
    business_state: (formData.get("business_state") as string)?.trim() || null,
    business_country: (formData.get("business_country") as string)?.trim() || null,
    business_postal_code: (formData.get("business_postal_code") as string)?.trim() || null,
    tax_id: (formData.get("tax_id") as string)?.trim() || null,
  };

  if (existingProfileId) {
    // Update existing profile
    const { error } = await supabase
      .from("business_profiles")
      .update(profileData)
      .eq("id", existingProfileId);

    if (error) {
      console.error("Error updating business profile:", error);
      return { error: "Failed to update business profile" };
    }
  } else {
    // Create new profile
    const { error } = await supabase
      .from("business_profiles")
      .insert(profileData);

    if (error) {
      console.error("Error creating business profile:", error);
      return { error: "Failed to create business profile" };
    }
  }

  return { success: true };
}
