import { auth } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  if (session) redirect("/dashboard");

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div>
        <p className="text-sm font-medium uppercase tracking-wide text-sky-800">
          M.Tech demo — simulated data only
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Edge–cloud healthcare monitoring
        </h1>
        <p className="mt-4 text-slate-600">
          Prototype dashboard: vitals ingestion via an{" "}
          <strong>Edge Route Handler</strong>, persistence on{" "}
          <strong>Neon Postgres</strong>, in-app alerts and medication
          scheduling. No medical advice; vitals are simulated.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        <Link
          className="rounded-lg bg-sky-700 px-5 py-2.5 font-medium text-white hover:bg-sky-800"
          href="/login"
        >
          Sign in (demo user)
        </Link>
        <Link
          className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-medium text-slate-800 hover:bg-slate-50"
          href="/thesis"
        >
          Thesis alignment
        </Link>
      </div>
      <p className="text-xs text-slate-500">
        Demo credential after <code className="rounded bg-slate-100 px-1">npm run db:seed</code>:{" "}
        <span className="font-mono">demo@local.test</span> /{" "}
        <span className="font-mono">demo-demo-demo</span>
      </p>
    </main>
  );
}
