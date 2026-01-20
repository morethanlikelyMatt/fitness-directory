import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { BusinessProfileForm } from "./business-profile-form";
import type { BusinessProfile } from "@/types/database";

export const metadata = {
  title: "Business Profile | Fitness Directory",
  description: "Manage your business profile",
};

export default async function BusinessProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Get existing business profile for this user
  const { data: businessProfile } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Get count of gyms linked to this business profile
  let gymCount = 0;
  if (businessProfile) {
    const { count } = await supabase
      .from("fitness_centers")
      .select("*", { count: "exact", head: true })
      .eq("business_profile_id", businessProfile.id);
    gymCount = count || 0;
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header showSearch={false} />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900">
              Business Profile
            </h1>
            <p className="mt-1 text-zinc-600">
              Manage your business information for all your fitness center listings
            </p>
          </div>

          {/* Stats */}
          {businessProfile && (
            <div className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-zinc-500">Linked Gyms</p>
                  <p className="text-2xl font-semibold text-zinc-900">{gymCount}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-500">Created</p>
                  <p className="text-sm font-medium text-zinc-900">
                    {new Date(businessProfile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6">
            <BusinessProfileForm
              userId={user.id}
              existingProfile={businessProfile as BusinessProfile | null}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
