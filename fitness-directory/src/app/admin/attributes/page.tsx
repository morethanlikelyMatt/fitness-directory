import { createClient } from "@/lib/supabase/server";
import { AttributesManager } from "./attributes-manager";

export const metadata = {
  title: "Attributes | Admin",
  description: "Manage gym attributes",
};

interface Attribute {
  id: string;
  name: string;
  slug: string;
  category: string;
  icon: string | null;
  created_at: string;
}

async function getAttributes(): Promise<Attribute[]> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("attributes")
    .select("*")
    .order("category")
    .order("name");

  return data || [];
}

export default async function AdminAttributesPage() {
  const attributes = await getAttributes();

  // Group by category
  const groupedAttributes: Record<string, Attribute[]> = {};
  for (const attr of attributes) {
    if (!groupedAttributes[attr.category]) {
      groupedAttributes[attr.category] = [];
    }
    groupedAttributes[attr.category].push(attr);
  }

  const categoryLabels: Record<string, string> = {
    equipment: "Equipment",
    amenity: "Amenities",
    class: "Classes",
    specialty: "Specialties",
    recovery: "Recovery",
  };

  const categoryOrder = ["equipment", "amenity", "class", "specialty", "recovery"];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">
            Attributes
          </h1>
          <p className="mt-1 text-zinc-600">
            Manage gym equipment, amenities, and features
          </p>
        </div>
      </div>

      <AttributesManager
        groupedAttributes={groupedAttributes}
        categoryLabels={categoryLabels}
        categoryOrder={categoryOrder}
      />
    </div>
  );
}
