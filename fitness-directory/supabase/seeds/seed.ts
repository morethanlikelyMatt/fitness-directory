/**
 * Seed script for Fitness Directory
 *
 * Usage:
 *   bun run supabase/seeds/seed.ts
 *   npx tsx supabase/seeds/seed.ts
 *
 * Requires SUPABASE_DB_URL or DATABASE_URL environment variable
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));

const SEED_FILES = [
  "01_attributes.sql",
  "02_fitness_centers.sql",
  "03_fitness_center_attributes.sql",
];

async function main() {
  console.log("\n🏋️ Fitness Directory - Database Seeding");
  console.log("========================================\n");

  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("❌ Error: No database URL found");
    console.error("");
    console.error("Set one of these environment variables:");
    console.error("  export SUPABASE_DB_URL='postgresql://...'");
    console.error("  export DATABASE_URL='postgresql://...'");
    console.error("");
    console.error("Or use Supabase CLI:");
    console.error("  supabase db reset");
    process.exit(1);
  }

  const sql = postgres(dbUrl);

  try {
    console.log("Running seed files...\n");

    for (const file of SEED_FILES) {
      const filepath = join(__dirname, file);
      process.stdout.write(`  📄 ${file}... `);

      try {
        const content = readFileSync(filepath, "utf-8");
        await sql.unsafe(content);
        console.log("✅");
      } catch (error) {
        console.log("❌");
        console.error(`\nError seeding ${file}:`, error);
        process.exit(1);
      }
    }

    console.log("\n✨ All seeds completed successfully!\n");
    console.log("Seeded data:");
    console.log("  • Attributes (equipment, amenities, classes, specialties, recovery)");
    console.log("  • Fitness centers (NYC, LA, Chicago, Austin, Miami)");
    console.log("  • Fitness center attribute mappings\n");
  } finally {
    await sql.end();
  }
}

main();
