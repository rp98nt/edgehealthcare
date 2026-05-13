import { config } from "dotenv";
import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import * as schema from "../src/db/schema";

config({ path: ".env.local" });
config();

const url = process.env.POSTGRES_URL;
if (!url) {
  console.error("Set POSTGRES_URL in .env.local");
  process.exit(1);
}

const db = drizzle(neon(url), { schema });

async function main() {
  const email = "demo@local.test";
  const password = "demo-demo-demo";
  const hash = await bcrypt.hash(password, 12);

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  let userId: string;
  if (existing[0]) {
    userId = existing[0].id;
    await db
      .update(schema.users)
      .set({ passwordHash: hash, name: "Demo patient" })
      .where(eq(schema.users.id, userId));
    console.log("Updated demo user:", email);
  } else {
    const inserted = await db
      .insert(schema.users)
      .values({
        email,
        name: "Demo patient",
        passwordHash: hash,
        role: "patient",
      })
      .returning({ id: schema.users.id });
    userId = inserted[0].id;
    console.log("Created demo user:", email);
  }

  const priorReadings = await db
    .select({ id: schema.readings.id })
    .from(schema.readings)
    .where(eq(schema.readings.userId, userId))
    .limit(1);

  if (priorReadings.length === 0) {
    const now = new Date();
    await db.insert(schema.readings).values([
      {
        userId,
        heartRateBpm: 72,
        temperatureC: 36.8,
        spo2Pct: 98,
        status: "normal",
        reasonsJson: JSON.stringify([]),
        recordedAt: new Date(now.getTime() - 60 * 60 * 1000),
      },
      {
        userId,
        heartRateBpm: 88,
        temperatureC: 36.9,
        spo2Pct: 97,
        status: "normal",
        reasonsJson: JSON.stringify([]),
        recordedAt: new Date(now.getTime() - 30 * 60 * 1000),
      },
    ]);
  }

  const priorMeds = await db
    .select({ id: schema.medications.id })
    .from(schema.medications)
    .where(eq(schema.medications.userId, userId))
    .limit(1);

  if (priorMeds.length === 0) {
    const now = new Date();
    await db.insert(schema.medications).values({
      userId,
      name: "Demo vitamin",
      dosage: "1 tablet",
      intervalHours: 8,
      nextDueAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
    });
  }

  console.log("\nDemo user id (for SIMULATE_USER_ID):");
  console.log(userId);
  console.log("\nLogin:", email, "/", password);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
