"use client";

import { useCallback, useEffect, useState } from "react";

type Reading = {
  id: string;
  heartRateBpm: number;
  temperatureC: number;
  spo2Pct: number;
  status: string;
  reasons: string[];
  recordedAt: string;
};

function statusStyle(s: string) {
  if (s === "critical") return "text-red-700 bg-red-50 border-red-200";
  if (s === "warning") return "text-amber-800 bg-amber-50 border-amber-200";
  return "text-emerald-800 bg-emerald-50 border-emerald-200";
}

export function DashboardVitals() {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/readings", { cache: "no-store" });
      if (!r.ok) {
        setError(r.status === 401 ? "Signed out" : "Could not load readings");
        return;
      }
      setError(null);
      const j = (await r.json()) as { readings: Reading[] };
      setReadings(j.readings);
    } catch {
      setError("Network error");
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 4000);
    return () => window.clearInterval(id);
  }, [load]);

  const latest = readings[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Vitals refresh every 4s (simulator + Edge ingest). Last 24 hours of
            readings.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Poll: <code className="rounded bg-slate-100 px-1">GET /api/readings</code>
        </p>
      </div>

      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {latest ? (
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase text-slate-500">
              Heart rate
            </p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">
              {latest.heartRateBpm}{" "}
              <span className="text-lg font-normal text-slate-500">bpm</span>
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase text-slate-500">
              Temperature
            </p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">
              {latest.temperatureC.toFixed(1)}
              <span className="text-lg font-normal text-slate-500"> °C</span>
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase text-slate-500">SpO₂</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">
              {latest.spo2Pct}
              <span className="text-lg font-normal text-slate-500"> %</span>
            </p>
          </div>
        </section>
      ) : !error ? (
        <p className="text-slate-600">No readings yet. Run the simulator script.</p>
      ) : null}

      {latest ? (
        <div
          className={`inline-flex rounded-lg border px-4 py-2 text-sm font-medium ${statusStyle(latest.status)}`}
        >
          Edge status: <span className="ml-2 uppercase">{latest.status}</span>
          {latest.reasons?.length ? (
            <span className="ml-2 font-normal">
              — {latest.reasons.join("; ")}
            </span>
          ) : null}
        </div>
      ) : null}

      <section>
        <h2 className="text-lg font-medium text-slate-900">Recent readings</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">HR</th>
                <th className="px-4 py-2">Temp</th>
                <th className="px-4 py-2">SpO₂</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {readings.slice(0, 20).map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-4 py-2 font-mono text-xs text-slate-600">
                    {new Date(r.recordedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{r.heartRateBpm}</td>
                  <td className="px-4 py-2">{r.temperatureC.toFixed(1)}</td>
                  <td className="px-4 py-2">{r.spo2Pct}</td>
                  <td className="px-4 py-2 capitalize">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
