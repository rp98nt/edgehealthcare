/**
 * Simulated device → POST /api/ingest (Edge handler + rules).
 *
 * Usage:
 *   SIMULATE_USER_ID=<uuid from seed> INGEST_API_KEY=<key> npm run simulate
 *   SIMULATE_SCENARIO=abnormal npm run simulate
 *
 * Optional: BASE_URL=http://localhost:3000
 */
import { config } from "dotenv";
import {
  sampleVitalsAbnormal,
  sampleVitalsNormal,
} from "../src/lib/demo/sampleVitals";

config({ path: ".env.local" });
config();

function envOrExit(name: string, hint: string): string {
  const v = process.env[name];
  if (typeof v !== "string" || v.length === 0) {
    console.error(`${hint} (set ${name}; run db:seed for user id).`);
    process.exit(1);
  }
  return v;
}

const base = process.env.BASE_URL ?? "http://localhost:3000";
const key = envOrExit("INGEST_API_KEY", "Need INGEST_API_KEY");
const userId = envOrExit("SIMULATE_USER_ID", "Need SIMULATE_USER_ID");
const scenario = process.env.SIMULATE_SCENARIO ?? "normal";

function vitals() {
  if (scenario === "abnormal" || scenario === "critical") {
    return sampleVitalsAbnormal();
  }
  return sampleVitalsNormal();
}

async function tick() {
  const v = vitals();
  const res = await fetch(`${base}/api/ingest`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Ingest-Key": key,
    },
    body: JSON.stringify({
      userId,
      ...v,
      recordedAt: new Date().toISOString(),
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(res.status, text);
    return;
  }
  console.log(new Date().toISOString(), v, "→", text);
}

const intervalMs = Number(process.env.SIMULATE_INTERVAL_MS ?? 5000);
void tick();
setInterval(() => void tick(), intervalMs);
