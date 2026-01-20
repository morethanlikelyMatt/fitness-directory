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
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-zinc-900">
                    Business Profile
                  </h1>
                  <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                    Business Account
                  </span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-zinc-600">
              Manage your business information for all your fitness center listings
            </p>
          </div>

          {/* Info Box for new users */}
          {!businessProfile && (
            <div className="mb-6 rounded-xl border border-purple-200 bg-purple-50 p-4">
              <div className="flex gap-3">
                <svg className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-purple-900">Create Your Business Account</h3>
                  <p className="mt-1 text-sm text-purple-700">
                    Set up a business profile to manage your gym listings professionally.
                    This allows you to add business contact details, tax information, and
                    manage multiple fitness centers under one account.
                  </p>
                </div>
              </div>
            </div>
          )}

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
