import { and, desc, eq, gte } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { readings } from "@/db/schema";

/** Use `auth()` wrapper so the session is read from this request (fixes 401 on `/api/readings` in production). */
export const GET = auth(async (req) => {
  const session = req.auth;
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fromIso = searchParams.get("from");
  const from = fromIso
    ? new Date(fromIso)
    : new Date(Date.now() - 24 * 60 * 60 * 1000);

  const list = await getDb()
    .select()
    .from(readings)
    .where(
      and(eq(readings.userId, session.user.id), gte(readings.recordedAt, from)),
    )
    .orderBy(desc(readings.recordedAt))
    .limit(500);

  return Response.json({
    readings: list.map((r) => ({
      id: r.id,
      heartRateBpm: r.heartRateBpm,
      temperatureC: r.temperatureC,
      spo2Pct: r.spo2Pct,
      status: r.status,
      reasons: r.reasonsJson ? JSON.parse(r.reasonsJson) : [],
      recordedAt: r.recordedAt.toISOString(),
    })),
  });
});
