import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { alerts, processingEvents, readings, users } from "@/db/schema";
import { processVitals } from "@/lib/edge/processVitals";
import { ingestBodySchema } from "@/lib/schemas/ingest";

export const runtime = "edge";

export async function POST(req: Request) {
  const key = req.headers.get("x-ingest-key");
  if (!key || key !== process.env.INGEST_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ingestBodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const userRows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, data.userId))
    .limit(1);
  if (!userRows[0]) {
    return NextResponse.json({ error: "Unknown userId" }, { status: 404 });
  }

  const recordedAt = data.recordedAt ? new Date(data.recordedAt) : new Date();
  const { status, reasons } = processVitals({
    heartRateBpm: data.heartRateBpm,
    temperatureC: data.temperatureC,
    spo2Pct: data.spo2Pct,
  });

  const [reading] = await db
    .insert(readings)
    .values({
      userId: data.userId,
      heartRateBpm: data.heartRateBpm,
      temperatureC: data.temperatureC,
      spo2Pct: data.spo2Pct,
      bpSys: data.bpSys ?? null,
      bpDia: data.bpDia ?? null,
      status,
      reasonsJson: JSON.stringify(reasons),
      recordedAt,
    })
    .returning();

  await db.insert(processingEvents).values({
    userId: data.userId,
    readingId: reading.id,
    stage: "edge",
    detail: JSON.stringify({ status, reasons }),
  });

  if (status === "critical" || status === "warning") {
    await db.insert(alerts).values({
      userId: data.userId,
      readingId: reading.id,
      severity: status,
      message:
        reasons.length > 0 ? reasons.join("; ") : `Automated status: ${status}`,
    });
  }

  return NextResponse.json({
    ok: true,
    readingId: reading.id,
    status,
    reasons,
  });
}
