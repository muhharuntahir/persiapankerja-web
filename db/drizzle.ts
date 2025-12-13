// db/drizzle.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

// Supabase pooler harus disable prepare: false
const client = postgres(process.env.DATABASE_URL!, {
  // prepare: false,
  max: 1, // ⬅️ penting di Supabase Pooler
  idle_timeout: 5,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });
export default db;
