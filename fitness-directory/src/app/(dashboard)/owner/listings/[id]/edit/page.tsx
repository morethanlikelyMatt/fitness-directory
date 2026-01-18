import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";
import { getUser } from "@/lib/supabase/auth";
import { getListing, getAttributes } from "../actions";
import { EditListingForm } from "./edit-form";

interface EditListingPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params;
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const [listing, attributes] = await Promise.all([
    getListing(id),
    getAttributes(),
  ]);

  if (!listing) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header showSearch={false} />

      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <Link
              href="/owner"
              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              ← Back to My Listings
            </Link>
          </div>

          <EditListingForm listing={listing} attributes={attributes} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
