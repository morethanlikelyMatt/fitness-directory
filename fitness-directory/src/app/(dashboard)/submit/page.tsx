import { redirect } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { getUser } from "@/lib/supabase/auth";
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

  const attributes = await getAttributes();

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50">
      <Header showSearch={false} />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="text-sm text-zinc-600 hover:text-zinc-900:text-white"
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
