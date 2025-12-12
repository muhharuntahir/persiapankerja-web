// db/drizzle.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// Supabase pooler harus disable prepare: false
const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
});

export const db = drizzle(client, { schema });
export default db;
