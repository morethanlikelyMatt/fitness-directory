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

export async function updateListingStatus(id: string, status: string) {
  const supabase = await verifyAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("fitness_centers")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating listing status:", error);
    return { error: "Failed to update status" };
  }

  revalidatePath("/admin/listings");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteListing(id: string) {
  const supabase = await verifyAdmin();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("fitness_centers")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting listing:", error);
    return { error: "Failed to delete listing" };
  }

  revalidatePath("/admin/listings");
  revalidatePath("/admin");
  return { success: true };
}
