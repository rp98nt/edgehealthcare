"use client";

import { useCallback, useEffect, useState } from "react";

type AlertRow = {
  id: string;
  severity: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/alerts", {
        cache: "no-store",
        credentials: "include",
      });
      if (!r.ok) {
        setError("Could not load alerts");
        return;
      }
      setError(null);
      const j = (await r.json()) as { alerts: AlertRow[] };
      setAlerts(j.alerts);
    } catch {
      setError("Network error");
    }
  }, []);

  useEffect(() => {
    void load();
    const id = window.setInterval(() => void load(), 5000);
    return () => window.clearInterval(id);
  }, [load]);

  async function markRead(id: string, read: boolean) {
    await fetch("/api/alerts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ id, read }),
    });
    void load();
  }

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Alerts</h1>
        <p className="mt-1 text-sm text-slate-600">
          In-app only. Created when Edge processing yields warning or critical
          status.
          {unread ? (
            <span className="ml-2 font-medium text-sky-800">
              {unread} unread
            </span>
          ) : null}
        </p>
      </div>
      {error ? (
        <p className="text-sm text-red-700">{error}</p>
      ) : alerts.length === 0 ? (
        <p className="text-slate-600">No alerts yet.</p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((a) => (
            <li
              key={a.id}
              className={`rounded-xl border px-4 py-3 ${
                a.read ? "border-slate-200 bg-white opacity-80" : "border-sky-200 bg-sky-50"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase text-slate-500">
                    {a.severity} ·{" "}
                    {new Date(a.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-1 text-slate-900">{a.message}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void markRead(a.id, !a.read)}
                  className="text-sm text-sky-800 underline hover:no-underline"
                >
                  {a.read ? "Mark unread" : "Mark read"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
