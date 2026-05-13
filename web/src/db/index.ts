import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const url = process.env.POSTGRES_URL;
if (!url) {
  throw new Error(
    "POSTGRES_URL is not set. Add it to .env.local (see .env.example).",
  );
}

const sql = neon(url);
export const db = drizzle(sql, { schema });
