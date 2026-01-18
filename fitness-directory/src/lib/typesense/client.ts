import Typesense from "typesense";

// Search-only client for frontend use
export function createSearchClient() {
  return new Typesense.Client({
    nodes: [
      {
        host: process.env.NEXT_PUBLIC_TYPESENSE_HOST!,
        port: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || "443"),
        protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || "https",
      },
    ],
    apiKey: process.env.NEXT_PUBLIC_TYPESENSE_SEARCH_ONLY_API_KEY!,
    connectionTimeoutSeconds: 2,
  });
}

// Admin client for server-side indexing operations
export function createAdminClient() {
  if (!process.env.TYPESENSE_ADMIN_API_KEY) {
    throw new Error("TYPESENSE_ADMIN_API_KEY is required for admin operations");
  }

  return new Typesense.Client({
    nodes: [
      {
        host: process.env.NEXT_PUBLIC_TYPESENSE_HOST!,
        port: parseInt(process.env.NEXT_PUBLIC_TYPESENSE_PORT || "443"),
        protocol: process.env.NEXT_PUBLIC_TYPESENSE_PROTOCOL || "https",
      },
    ],
    apiKey: process.env.TYPESENSE_ADMIN_API_KEY,
    connectionTimeoutSeconds: 5,
  });
}
