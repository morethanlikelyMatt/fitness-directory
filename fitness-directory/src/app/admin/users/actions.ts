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

export async function updateUserRole(id: string, role: string) {
  const supabase = await verifyAdmin();

  const validRoles = ["user", "owner", "admin"];
  if (!validRoles.includes(role)) {
    return { error: "Invalid role" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("users")
    .update({ role })
    .eq("id", id);

  if (error) {
    console.error("Error updating user role:", error);
    return { error: "Failed to update role" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
