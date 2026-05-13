"use client";

import { useCallback, useEffect, useState } from "react";

const POLL_MS = 4000;
const SIM_INTERVAL_MS = 5000;

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
  const [simulateOn, setSimulateOn] = useState(false);
  const [simMessage, setSimMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/readings", {
        cache: "no-store",
        credentials: "include",
      });
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
    const id = window.setInterval(() => void load(), POLL_MS);
    return () => window.clearInterval(id);
  }, [load]);

  const runSimTick = useCallback(async () => {
    try {
      const r = await fetch("/api/demo/simulate-tick", {
        method: "POST",
        credentials: "include",
      });
      if (r.status === 403) {
        setSimMessage(
          "Demo simulator is disabled. Set ENABLE_DEMO_SIMULATOR=1 (or true) in Vercel env, redeploy, then try again.",
        );
        setSimulateOn(false);
        return;
      }
      if (!r.ok) {
        setSimMessage(`Sim tick failed (${r.status}).`);
        return;
      }
      setSimMessage(null);
      await load();
    } catch {
      setSimMessage("Network error during sim tick.");
    }
  }, [load]);

  useEffect(() => {
    if (!simulateOn) return;
    void runSimTick();
    const id = window.setInterval(() => void runSimTick(), SIM_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [simulateOn, runSimTick]);

  const latest = readings[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-sm text-slate-600">
            Vitals refresh every {POLL_MS / 1000}s. Optional in-app demo adds a
            synthetic reading every {SIM_INTERVAL_MS / 1000}s (same rules as
            Edge ingest).
          </p>
        </div>
        <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            role="switch"
            aria-checked={simulateOn}
            aria-label="Simulate vitals every 5 seconds"
            onClick={() => {
              setSimMessage(null);
              setSimulateOn((v) => !v);
            }}
            className={`relative inline-flex h-8 w-14 shrink-0 rounded-full border transition-colors ${
              simulateOn
                ? "border-sky-700 bg-sky-700"
                : "border-slate-300 bg-slate-200"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-7 w-7 rounded-full bg-white shadow transition-transform ${
                simulateOn ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
          <span className="text-xs text-slate-600">
            Simulate vitals{" "}
            <span className="font-medium text-slate-800">
              ({simulateOn ? "on" : "off"})
            </span>
          </span>
          <p className="text-xs text-slate-500">
            <code className="rounded bg-slate-100 px-1">GET /api/readings</code>
          </p>
        </div>
      </div>

      {simMessage ? (
        <p className="rounded border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900">
          {simMessage}
        </p>
      ) : null}

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
        <p className="text-slate-600">
          No readings yet. Turn on <strong>Simulate vitals</strong> (if enabled
          on the server) or run <code className="rounded bg-slate-100 px-1">npm run simulate</code>.
        </p>
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
