import { desc, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { medications } from "@/db/schema";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await getDb()
    .select()
    .from(medications)
    .where(eq(medications.userId, session.user.id))
    .orderBy(desc(medications.createdAt));

  return Response.json({
    medications: rows.map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage,
      intervalHours: m.intervalHours,
      nextDueAt: m.nextDueAt.toISOString(),
      overdue: m.nextDueAt.getTime() < Date.now(),
    })),
  });
}
