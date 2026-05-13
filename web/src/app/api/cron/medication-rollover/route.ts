import { lt } from "drizzle-orm";
import { getDb } from "@/db";
import { medications } from "@/db/schema";

/** Vercel Cron: report overdue medication rows (no automatic dose changes). */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = new Date();
  const overdue = await getDb()
    .select({ id: medications.id })
    .from(medications)
    .where(lt(medications.nextDueAt, now));

  return Response.json({
    ok: true,
    overdueCount: overdue.length,
    checkedAt: now.toISOString(),
  });
}
