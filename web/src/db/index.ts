import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

let cached: ReturnType<typeof drizzle<typeof schema>> | null = null;

function firstNonEmptyEnv(keys: string[]): string | undefined {
  for (const key of keys) {
    const v = process.env[key];
    if (typeof v === "string" && v.trim().length > 0) return v;
  }
  return undefined;
}

function getConnectionString(): string | undefined {
  return firstNonEmptyEnv([
    "POSTGRES_URL",
    "DATABASE_URL",
    "POSTGRES_PRISMA_URL",
  ]);
}

/**
 * Lazy Neon + Drizzle client so `next build` can import route modules
 * without `POSTGRES_URL` being read at module load time.
 * Still required at runtime when DB is first used.
 */
export function getDb() {
  if (cached) return cached;
  const url = getConnectionString();
  if (!url) {
    throw new Error(
      "POSTGRES_URL or DATABASE_URL is not set. Add it in Vercel → Environment Variables or .env.local (see .env.example).",
    );
  }
  cached = drizzle(neon(url), { schema });
  return cached;
}
