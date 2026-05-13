import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/db";
import { medications } from "@/db/schema";
import {
  addMedication,
  deleteMedicationAction,
  markMedicationTakenAction,
} from "@/app/actions/medication";

export default async function MedicationsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const rows = await getDb()
    .select()
    .from(medications)
    .where(eq(medications.userId, session.user.id));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Medications</h1>
        <p className="mt-1 text-sm text-slate-600">
          Demo scheduling: next dose time advances when you mark “taken”.
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-slate-900">Add medication</h2>
        <form action={addMedication} className="mt-4 grid max-w-xl gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="text-slate-700">Name</span>
            <input
              name="name"
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="e.g. Metformin"
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="text-slate-700">Dosage / notes</span>
            <input
              name="dosage"
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
              placeholder="500 mg with meal"
            />
          </label>
          <label className="block text-sm">
            <span className="text-slate-700">Interval (hours)</span>
            <input
              name="intervalHours"
              type="number"
              min={1}
              defaultValue={8}
              required
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            />
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="rounded-lg bg-sky-700 px-4 py-2 font-medium text-white hover:bg-sky-800"
            >
              Save
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-lg font-medium text-slate-900">Your schedule</h2>
        {rows.length === 0 ? (
          <p className="mt-2 text-slate-600">No medications yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {rows.map((m) => {
              const overdue = m.nextDueAt.getTime() < Date.now();
              return (
                <li
                  key={m.id}
                  className={`flex flex-wrap items-center justify-between gap-4 rounded-xl border px-4 py-3 ${
                    overdue
                      ? "border-amber-300 bg-amber-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div>
                    <p className="font-medium text-slate-900">{m.name}</p>
                    <p className="text-sm text-slate-600">{m.dosage}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Every {m.intervalHours}h — next due{" "}
                      {m.nextDueAt.toLocaleString()}
                      {overdue ? (
                        <span className="ml-2 font-semibold text-amber-800">
                          (overdue)
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <form action={markMedicationTakenAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50"
                      >
                        Mark taken
                      </button>
                    </form>
                    <form action={deleteMedicationAction}>
                      <input type="hidden" name="id" value={m.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm text-red-800 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
