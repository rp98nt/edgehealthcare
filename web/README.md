# Healthcare thesis demo (Next.js)

Simulated **IoT vitals** → **Edge Route Handler** (`/api/ingest` + `lib/edge/processVitals`) → **Neon Postgres** → dashboard with **in-app alerts** and **medications**. Not a medical device; see `../doc/THESIS_DEMO_IMPLEMENTATION_PLAN.md`.

## Prerequisites

- Node 20+
- Vercel Postgres (Neon) — copy `POSTGRES_URL` into `.env.local`

## Setup

```bash
cd web
npm install
cp .env.example .env.local
# Fill POSTGRES_URL, POSTGRES_URL_NON_POOLING (optional), AUTH_SECRET, AUTH_URL, INGEST_API_KEY
npm run db:push
npm run db:seed
# Paste printed user id into SIMULATE_USER_ID in .env.local
npm run dev
```

In another terminal (with dev server running):

```bash
cd web
npm run simulate
```

Use `SIMULATE_SCENARIO=abnormal` for warning/critical demos.

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js dev |
| `npm run build` / `start` | Production |
| `npm run db:push` | Apply Drizzle schema to Postgres |
| `npm run db:seed` | Demo user + sample rows |
| `npm run simulate` | POST vitals to `/api/ingest` |
| `npm test` | Vitest (`processVitals` rules) |

## Deploy (Vercel)

1. Import this `web` folder as a Vercel project (root directory `web` if repo is parent).
2. Add Storage → Postgres; set env vars in Vercel (`AUTH_SECRET`, `AUTH_URL`, `INGEST_API_KEY`, etc.).
3. Run `db:push` or migrate from CI/local against prod `POSTGRES_URL_NON_POOLING`.
4. Optional Cron: set `CRON_SECRET` and add `vercel.json` cron hitting `/api/cron/medication-rollover` with `Authorization: Bearer …`.

## Demo login

After seed: **demo@local.test** / **demo-demo-demo**
