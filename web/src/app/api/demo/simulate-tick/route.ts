import { auth } from "@/auth";
import {
  sampleVitalsAbnormal,
  sampleVitalsNormal,
} from "@/lib/demo/sampleVitals";
import { persistReading } from "@/lib/ingest/persistReading";

export const runtime = "nodejs";

function demoEnabled(): boolean {
  const v = process.env.ENABLE_DEMO_SIMULATOR;
  return v === "1" || v === "true";
}

/** Authenticated one-shot synthetic vitals (dashboard toggle). No ingest API key. */
export const POST = auth(async (req) => {
  if (!demoEnabled()) {
    return Response.json(
      { error: "Demo simulator disabled. Set ENABLE_DEMO_SIMULATOR=1 in env." },
      { status: 403 },
    );
  }

  const session = req.auth;
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = new URL(req.url).searchParams.get("mode");
  const vitals =
    mode === "abnormal" ? sampleVitalsAbnormal() : sampleVitalsNormal();

  const result = await persistReading({
    userId: session.user.id,
    ...vitals,
    recordedAt: new Date(),
  });

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: result.status });
  }

  return Response.json({
    ok: true,
    readingId: result.readingId,
    status: result.status,
    reasons: result.reasons,
    vitals,
  });
});
