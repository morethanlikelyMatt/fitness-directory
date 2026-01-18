"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import { headers } from "next/headers";

export type AuthResult = {
  error?: string;
  success?: boolean;
};

export async function login(
  formData: FormData,
  redirectTo?: string
): Promise<AuthResult> {
  const supabase = await createServerClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect(redirectTo || "/dashboard");
}

export async function signup(formData: FormData): Promise<AuthResult> {
  const supabase = await createServerClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || "";

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        name: name || undefined,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // For email confirmation flow, redirect to check email page
  // For instant signup (if email confirmation is disabled), redirect to dashboard
  revalidatePath("/", "layout");
  redirect("/auth/check-email");
}

export async function logout(): Promise<void> {
  const supabase = await createServerClient();

  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}

export async function loginWithOAuth(
  provider: "google" | "apple"
): Promise<{ url?: string; error?: string }> {
  const supabase = await createServerClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || "";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { url: data.url };
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createServerClient();
  const headersList = await headers();
  const origin = headersList.get("origin") || "";

  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const supabase = await createServerClient();

  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Password is required" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
