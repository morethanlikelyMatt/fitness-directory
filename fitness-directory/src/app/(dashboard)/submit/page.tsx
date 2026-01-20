import { redirect } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { getAttributes } from "./actions";
import { SubmitGymForm } from "./submit-form";

export const metadata = {
  title: "Submit Your Gym | Fitness Directory",
  description: "Add your fitness center to the directory",
};

export default async function SubmitPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login?next=/submit");
  }

  const supabase = await createClient();

  // Check if user is a business user (owner or admin)
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const isBusinessUser = userData?.role === "owner" || userData?.role === "admin";

  // If not a business user, show prompt to create business account
  if (!isBusinessUser) {
    return (
      <div className="flex min-h-screen flex-col bg-zinc-50">
        <Header showSearch={false} />

        <main className="flex-1 px-6 py-8">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-purple-200 bg-white p-8 text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <svg
                  className="h-8 w-8 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>

              <h1 className="text-2xl font-bold text-zinc-900">
                Business Account Required
              </h1>

              <p className="mt-4 text-zinc-600">
                To list a fitness center on Fitness Directory, you need a business account.
                This helps us verify gym owners and maintain quality listings.
              </p>

              <div className="mt-8 space-y-4">
                <Link
                  href="/signup/business"
                  className="block w-full rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 transition-colors"
                >
                  Create Business Account
                </Link>

                <p className="text-sm text-zinc-500">
                  Already have a business account?{" "}
                  <Link
                    href="/login?next=/submit"
                    className="font-medium text-purple-600 hover:text-purple-700"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              <div className="mt-8 rounded-xl bg-purple-50 p-4 text-left">
                <h3 className="font-medium text-purple-900 text-sm">Business Account Benefits</h3>
                <ul className="mt-2 text-sm text-purple-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    List and manage multiple fitness centers
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Access business analytics and insights
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Premium listing options available
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/dashboard"
                className="text-sm text-zinc-600 hover:text-zinc-900"
              >
                ← Back to dashboard
              </Link>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const attributes = await getAttributes();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header showSearch={false} />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <Link
              href="/owner"
              className="text-sm text-zinc-600 hover:text-zinc-900"
            >
              ← Back to dashboard
            </Link>
          </div>

          <SubmitGymForm attributes={attributes} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
