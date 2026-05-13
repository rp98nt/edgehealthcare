import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { alerts } from "@/db/schema";

export const GET = auth(async (req) => {
  const session = req.auth;
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await getDb()
    .select()
    .from(alerts)
    .where(eq(alerts.userId, session.user.id))
    .orderBy(desc(alerts.createdAt))
    .limit(100);

  return Response.json({
    alerts: rows.map((a) => ({
      id: a.id,
      severity: a.severity,
      message: a.message,
      read: a.read,
      createdAt: a.createdAt.toISOString(),
    })),
  });
});

export const PATCH = auth(async (req) => {
  const session = req.auth;
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await req.json()) as { id?: string; read?: boolean };
  if (!body.id || typeof body.read !== "boolean") {
    return Response.json({ error: "Invalid body" }, { status: 400 });
  }
  const updated = await getDb()
    .update(alerts)
    .set({ read: body.read })
    .where(eq(alerts.id, body.id))
    .returning();
  if (!updated[0] || updated[0].userId !== session.user.id) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ ok: true });
});
