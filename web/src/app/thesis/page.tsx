import Link from "next/link";

export default function ThesisPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm text-sky-800">
        <Link href="/" className="underline">
          Home
        </Link>
        {" · "}
        <Link href="/dashboard" className="underline">
          Dashboard
        </Link>{" "}
        (requires sign-in)
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-slate-900">
        Thesis alignment
      </h1>
      <p className="mt-4 text-slate-700">
        This web app implements the thesis narrative at a <strong>software</strong>{" "}
        level: no physical sensors; vitals are <strong>simulated</strong> and sent
        to an <strong>Edge Runtime</strong> ingest route that runs the same rule
        logic as in the thesis draft (heart rate, temperature, SpO₂ thresholds).
        Results persist in <strong>Neon Postgres</strong> (Vercel Postgres).
        Alerts appear <strong>only in the application</strong>—no email or SMS.
      </p>
      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-left">
            <th className="py-2 pr-4">Thesis area</th>
            <th className="py-2">This demo</th>
          </tr>
        </thead>
        <tbody className="text-slate-700">
          <tr className="border-b border-slate-200">
            <td className="py-3 pr-4 font-medium text-slate-900">IoT sensors</td>
            <td className="py-3">
              <code className="rounded bg-slate-100 px-1">scripts/simulate.ts</code>{" "}
              → <code className="rounded bg-slate-100 px-1">POST /api/ingest</code>
            </td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-3 pr-4 font-medium text-slate-900">Edge computing</td>
            <td className="py-3">
              <code className="rounded bg-slate-100 px-1">api/ingest</code> (
              <code>export const runtime = &quot;edge&quot;</code>) +{" "}
              <code className="rounded bg-slate-100 px-1">lib/edge/processVitals</code>
            </td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-3 pr-4 font-medium text-slate-900">Cloud</td>
            <td className="py-3">PostgreSQL + Route Handlers + Server Actions</td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-3 pr-4 font-medium text-slate-900">Alerts</td>
            <td className="py-3">
              Rows in <code className="rounded bg-slate-100 px-1">alerts</code> +{" "}
              <code className="rounded bg-slate-100 px-1">/alerts</code> UI
            </td>
          </tr>
          <tr className="border-b border-slate-200">
            <td className="py-3 pr-4 font-medium text-slate-900">Medication</td>
            <td className="py-3">
              <code className="rounded bg-slate-100 px-1">/medications</code> + optional
              Vercel Cron on{" "}
              <code className="rounded bg-slate-100 px-1">
                /api/cron/medication-rollover
              </code>
            </td>
          </tr>
          <tr>
            <td className="py-3 pr-4 font-medium text-slate-900">Security</td>
            <td className="py-3">
              Auth.js (credentials), HTTPS on Vercel,{" "}
              <code className="rounded bg-slate-100 px-1">X-Ingest-Key</code> for ingest
            </td>
          </tr>
        </tbody>
      </table>
    </main>
  );
}
