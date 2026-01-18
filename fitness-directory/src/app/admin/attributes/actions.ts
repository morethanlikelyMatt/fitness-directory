"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/supabase/auth";

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

  return supabase;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createAttribute(
  name: string,
  category: string,
  icon?: string
) {
  const supabase = await verifyAdmin();

  const slug = generateSlug(name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("attributes").insert({
    name,
    slug,
    category,
    icon: icon || null,
  });

  if (error) {
    console.error("Error creating attribute:", error);
    return { error: "Failed to create attribute" };
  }

  revalidatePath("/admin/attributes");
  return { success: true };
}

export async function updateAttribute(
  id: string,
  name: string,
  category: string,
  icon?: string
) {
  const supabase = await verifyAdmin();

  const slug = generateSlug(name);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("attributes")
    .update({
      name,
      slug,
      category,
      icon: icon || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Error updating attribute:", error);
    return { error: "Failed to update attribute" };
  }

  revalidatePath("/admin/attributes");
  return { success: true };
}

export async function deleteAttribute(id: string) {
  const supabase = await verifyAdmin();

  // First delete any fitness_center_attributes that use this attribute
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("fitness_center_attributes")
    .delete()
    .eq("attribute_id", id);

  // Then delete the attribute
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("attributes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting attribute:", error);
    return { error: "Failed to delete attribute" };
  }

  revalidatePath("/admin/attributes");
  return { success: true };
}
