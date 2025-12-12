// scripts/reset.ts
import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

import * as schema from "../db/schema";

const connectionString = process.env.DATABASE_URL!;

// ⚠ Supabase Pooler tidak mendukung prepared statements
const client = postgres(connectionString, { prepare: false });

const db = drizzle(client, { schema });

const main = async () => {
  try {
    console.log("🔄 Resetting database...");

    await db.delete(schema.challengeOptions);
    await db.delete(schema.challengeProgress);
    await db.delete(schema.challenges);
    await db.delete(schema.lessons);
    await db.delete(schema.units);
    await db.delete(schema.userProgress);
    await db.delete(schema.userSubscription);
    await db.delete(schema.courses);

    console.log("✅ Database reset complete.");
  } catch (error) {
    console.error("❌ Error resetting database:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

main();
