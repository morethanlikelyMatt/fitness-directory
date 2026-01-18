/**
 * Script to set up the Typesense collection
 * Run with: npx tsx scripts/setup-typesense.ts
 */

import { createAdminClient, fitnessCentersSchema, COLLECTION_NAME } from "../src/lib/typesense";

async function setupCollection() {
  const client = createAdminClient();

  console.log("Setting up Typesense collection...\n");

  // Check if collection exists
  try {
    const existing = await client.collections(COLLECTION_NAME).retrieve();
    console.log(`Collection "${COLLECTION_NAME}" already exists.`);
    console.log(`  Documents: ${existing.num_documents}`);
    console.log(`  Created at: ${new Date(existing.created_at * 1000).toISOString()}`);

    const readline = await import("readline");
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const answer = await new Promise<string>((resolve) => {
      rl.question("\nDo you want to delete and recreate? (yes/no): ", resolve);
    });
    rl.close();

    if (answer.toLowerCase() !== "yes") {
      console.log("Keeping existing collection.");
      return;
    }

    console.log("\nDeleting existing collection...");
    await client.collections(COLLECTION_NAME).delete();
    console.log("Deleted.");
  } catch (error) {
    // Collection doesn't exist, which is fine
    if ((error as { httpStatus?: number }).httpStatus !== 404) {
      throw error;
    }
  }

  // Create collection
  console.log("\nCreating collection with schema:");
  console.log(JSON.stringify(fitnessCentersSchema, null, 2));

  await client.collections().create(fitnessCentersSchema);

  console.log(`\n✓ Collection "${COLLECTION_NAME}" created successfully!`);
}

setupCollection().catch((error) => {
  console.error("Error setting up collection:", error);
  process.exit(1);
});
