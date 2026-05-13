import { NextResponse } from "next/server";
import { persistReading } from "@/lib/ingest/persistReading";
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
  const recordedAt = data.recordedAt ? new Date(data.recordedAt) : new Date();
  const result = await persistReading({
    userId: data.userId,
    heartRateBpm: data.heartRateBpm,
    temperatureC: data.temperatureC,
    spo2Pct: data.spo2Pct,
    bpSys: data.bpSys ?? null,
    bpDia: data.bpDia ?? null,
    recordedAt,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  return NextResponse.json({
    ok: true,
    readingId: result.readingId,
    status: result.status,
    reasons: result.reasons,
  });
}
