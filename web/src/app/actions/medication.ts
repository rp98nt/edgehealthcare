"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { medications } from "@/db/schema";

const addSchema = z.object({
  name: z.string().min(1).max(200),
  dosage: z.string().min(1).max(500),
  intervalHours: z.coerce.number().int().min(1).max(168),
});

export async function addMedication(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const parsed = addSchema.safeParse({
    name: formData.get("name"),
    dosage: formData.get("dosage"),
    intervalHours: formData.get("intervalHours"),
  });
  if (!parsed.success) throw new Error("Invalid input");

  const nextDueAt = new Date(
    Date.now() + parsed.data.intervalHours * 60 * 60 * 1000,
  );

  await getDb().insert(medications).values({
    userId: session.user.id,
    name: parsed.data.name,
    dosage: parsed.data.dosage,
    intervalHours: parsed.data.intervalHours,
    nextDueAt,
  });
  revalidatePath("/medications");
}

export async function markMedicationTaken(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const rows = await getDb()
    .select()
    .from(medications)
    .where(eq(medications.id, id))
    .limit(1);
  const m = rows[0];
  if (!m || m.userId !== session.user.id) throw new Error("Not found");

  const nextDueAt = new Date(
    Date.now() + m.intervalHours * 60 * 60 * 1000,
  );
  await getDb()
    .update(medications)
    .set({ nextDueAt })
    .where(eq(medications.id, id));
  revalidatePath("/medications");
}

export async function deleteMedication(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const rows = await getDb()
    .select()
    .from(medications)
    .where(eq(medications.id, id))
    .limit(1);
  const m = rows[0];
  if (!m || m.userId !== session.user.id) throw new Error("Not found");

  await getDb().delete(medications).where(eq(medications.id, id));
  revalidatePath("/medications");
}

export async function markMedicationTakenAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Invalid id");
  await markMedicationTaken(id);
}

export async function deleteMedicationAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Invalid id");
  await deleteMedication(id);
}
