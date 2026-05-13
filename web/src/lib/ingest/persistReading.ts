import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { alerts, processingEvents, readings, users } from "@/db/schema";
import { processVitals } from "@/lib/edge/processVitals";

export type PersistReadingInput = {
  userId: string;
  heartRateBpm: number;
  temperatureC: number;
  spo2Pct: number;
  bpSys?: number | null;
  bpDia?: number | null;
  recordedAt: Date;
};

export type PersistReadingResult =
  | { ok: true; readingId: string; status: string; reasons: string[] }
  | { ok: false; error: string; status: number };

/** Shared ingest persistence (Edge ingest + authenticated demo tick). */
export async function persistReading(
  input: PersistReadingInput,
): Promise<PersistReadingResult> {
  const {
    userId,
    heartRateBpm,
    temperatureC,
    spo2Pct,
    bpSys,
    bpDia,
    recordedAt,
  } = input;

  const userRows = await getDb()
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!userRows[0]) {
    return { ok: false, error: "Unknown userId", status: 404 };
  }

  const { status, reasons } = processVitals({
    heartRateBpm,
    temperatureC,
    spo2Pct,
  });

  const [reading] = await getDb()
    .insert(readings)
    .values({
      userId,
      heartRateBpm,
      temperatureC,
      spo2Pct,
      bpSys: bpSys ?? null,
      bpDia: bpDia ?? null,
      status,
      reasonsJson: JSON.stringify(reasons),
      recordedAt,
    })
    .returning();

  await getDb().insert(processingEvents).values({
    userId,
    readingId: reading.id,
    stage: "edge",
    detail: JSON.stringify({ status, reasons }),
  });

  if (status === "critical" || status === "warning") {
    await getDb().insert(alerts).values({
      userId,
      readingId: reading.id,
      severity: status,
      message:
        reasons.length > 0 ? reasons.join("; ") : `Automated status: ${status}`,
    });
  }

  return { ok: true, readingId: reading.id, status, reasons };
}
