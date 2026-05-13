# Implementation Plan: Edge–Cloud Healthcare Monitoring Demo

**Purpose:** Build a **hosted web demonstration** of *Edge Cloud Healthcare Monitoring with Intelligent Diagnostic and Medication System* **without physical medical hardware**.

**Audience:** Implementers; use this as the canonical checklist.

**Thesis reference:** `healthcarerough.xml` — layers: IoT → edge → cloud → diagnosis → alerts → medication → security.

**Stack lock:** **Next.js** on **Vercel**, **PostgreSQL** for persistence via **Vercel Postgres** — **Neon**-powered Postgres you **create and manage from the Vercel dashboard** (storage, branches, connection strings). This thesis demo is intended to run on the **Vercel + Neon free tier** you already have access to; scale and quotas are enough for simulated load if you keep migrations lean and avoid huge retention of raw vitals. **In-app notifications only** (no email/SMS/push vendors). **Minimize `npm` dependencies:** prefer Next.js built-ins, one small ORM, one validator, and one auth approach.

---

## Document map

| Section | Use for… |
|--------|----------|
| [1. Goals & constraints](#1-goals--constraints) | Scope and “done” |
| [2. Scope statement](#2-scope-statement-for-viva--reports) | Examiner wording |
| [3. Architecture](#3-target-architecture) | Routes and data flow |
| [4. Dependencies](#4-dependencies-and-tooling-minimal) | What to install and what to skip |
| [5. Roadmap](#5-roadmap-phases) | Phase order |
| [6. WBS](#6-work-breakdown) | Task list |
| [7. Milestones](#7-milestones) | Acceptance checks |
| [8. Vercel ops](#8-vercel-hosting) | Deploy and env |
| [9. Demo script](#9-demo-script) | Presentation flow |
| [10. Risks](#10-risks) | Mitigations |
| [11. Thesis index](#11-thesis-to-demo-mapping) | Chapter ↔ feature |

---

## 1. Goals & constraints

**Goals:** Simulated vitals → **edge-style processing** (Next.js **Edge Runtime** where viable) → **PostgreSQL** → dashboard; **alerts and medication cues only inside the app**; deploy on Vercel with honest labeling as a prototype.

**Hard constraints:** No new hardware purchases; web-first demo; **no external notification providers** (no transactional email APIs, no push gateways).

**Non-goals:** Regulatory/clinical claims; proving real-world edge latency without a defined experiment; WebSocket servers as long-lived processes on Vercel.

**Minimum “near working” product:** Auth user sees a dashboard fed by simulated data; edge handler applies rules; DB stores readings/alerts/meds; **alert list / banners / badges in UI**; medication schedule and overdue cues **in UI**; optional **Vercel Cron** to mark overdue doses (platform cron, not an extra SaaS). README + diagram state what is simulated.

---

## 2. Scope statement (for viva / reports)

> This is a **software prototype**. Vitals are **simulated or file-replayed**, not from certified devices. **“Edge”** means **Next.js Edge Runtime** (or isolates) for ingestion and first-pass processing, separate from **PostgreSQL (Neon via Vercel Postgres)** used for durable storage and analytics—**not** a claim about hospital-grade on-prem gateways. **Outputs are illustrative risk/status flags**, not diagnoses. **Notifications are shown only in the web application.** Deployment uses **Vercel** serverless/edge and **managed Neon Postgres** on the project’s **free tier** for this demonstration.

---

## 3. Target architecture

```
[SIMULATOR] ──HTTPS (ingest API key)──► [Edge Route Handler]
                                            │  rules / status
                                            ├─► alerts (DB rows) → UI
                                            ▼
                                      [Neon Postgres (Vercel Postgres)]
                                            ▼
                                      [Next.js App UI]
```

- **Edge:** e.g. `app/api/ingest/.../route.ts` with `runtime = 'edge'` when the stack allows; core logic in `lib/edge/*` (pure functions, unit-tested).
- **Cloud:** **Neon Postgres** (linked as **Vercel Postgres**) + **Node** Route Handlers / **Server Actions** for reads/writes and reporting.
- **Live UI:** Short-interval **`fetch` polling** from a small Client Component (no data-library layer required). Avoid WebSockets on Vercel for this MVP.

**Standard vitals fields (early):** `heart_rate_bpm`, `temperature_c`, `spo2_pct`, optional BP; `timestamp` (ISO); `user_id`; derived `status`/enum after processing.

---

## 4. Dependencies and tooling (minimal)

**Install / rely on (keep the list short):**

| Area | Choice | Notes |
|------|--------|--------|
| App | **Next.js** (App Router), **React**, **TypeScript** | `create-next-app` |
| Database | **PostgreSQL** via **Vercel Postgres (Neon)** | Provision in the Vercel project (**Storage** → Postgres); Neon console is linked for branches/usage. **Free tier** is the default target for this MVP—adequate for development, previews, and examiner demos if you cap simulator volume and retention. |
| Access layer | **Drizzle ORM** + **drizzle-kit** | One ORM only; avoids a second query stack |
| Validation | **Zod** | Ingest + forms + Server Actions |
| Styling | **Tailwind CSS** | Default with CNA; build UI with primitives/HTML—**skip** component kits that pull many `@radix-ui/*` packages unless you truly need them |
| Auth | **Auth.js** v5 | Single supported auth dependency; credentials provider for demo accounts |
| Password hashing | **@node-rs/argon2** (or **bcrypt**) | Used inside credentials flow |
| Tests (dev) | **Vitest** | For `lib/edge` rules only |

**Do not add for this project:** email APIs (e.g. Resend), Redis/Upstash, Inngest, Pusher/Ably/SSE vendors, Sentry/Vercel Analytics (optional later and off-plan), extra real-time libraries, hosted ML/AI inference services. **Notifications = DB + UI** only. **Diagnosis in this demo is rule-based only** (`lib/edge/processVitals`), not learned models.

**Rate limiting / abuse (without Redis):** **Strong random `INGEST_API_KEY`**; optional “low fixed QPS” only if you implement a tiny in-process guard (best-effort on serverless) or accept thesis-only traffic. Document reliance on **secret + HTTPS**.

**Local dev:** `next dev`; connect to the **same Neon database** (pooled URL for serverless) via env vars from **`vercel env pull`** into `.env.local`. Optional: create a **Neon development branch** from the dashboard for isolation; for minimal setup, **Preview** and **Production** can use separate Vercel env targets pointing at different branches if you want parity with `main` vs PRs.

---

## 5. Roadmap (phases)

| Phase | Focus | Rough duration* |
|-------|--------|-----------------|
| **P0** | Next app, lint/format, `.env.example`, `doc/ARCHITECTURE.md` | 2–4 d |
| **P1** | Drizzle schema, migrations, Zod DTOs, seed | 3–5 d |
| **P2** | Simulator → edge ingest → DB → JSON read APIs + RSC | 5–10 d |
| **P3** | Dashboard + polling + thesis alignment page | 5–10 d |
| **P4** | In-app alerts + medication + optional Vercel Cron | 3–7 d |
| **P5** | Auth hardening, RBAC sketch, security headers, HTTPS (Vercel) | 3–6 d |
| **P6** | Production Vercel + **Neon Postgres (free tier)** + previews + demo capture | 3–6 d |

\*Part-time; scale with availability. Run **P6** previews from **P3** onward.

---

## 6. Work breakdown

### P0 — Foundations
| ID | Task | Output |
|----|------|--------|
| P0.1 | `create-next-app` (TS, Tailwind, ESLint, App Router) | Single app repo |
| P0.2 | `.env.example` + README env section | No secrets in git |
| P0.3 | Prettier + strict TS + clean `next lint` | Green baseline |
| P0.4 | `doc/ARCHITECTURE.md` (Mermaid) | Thesis ↔ routes |

### P1 — Data
| ID | Task | Output |
|----|------|--------|
| P1.1 | ERD users / readings / alerts / medications | `doc/DATA_MODEL.md` |
| P1.2 | Drizzle schema + migrations | Applied locally/prod |
| P1.3 | Zod schemas in `lib/schemas` | Shared types |
| P1.4 | `db:seed` demo user + readings | Repeatable seed |

### P2 — Pipeline
| ID | Task | Output |
|----|------|--------|
| P2.1 | Simulator POSTing to ingest route | Configurable scenarios |
| P2.2 | `lib/edge/processVitals` + Vitest | Rule tests |
| P2.3 | Persist raw + derived fields | Queryable Postgres |
| P2.4 | `GET` time-range for charts | JSON for UI |
| P2.5 | Optional `processing_event` table | Trace for write-up |

Rule examples: HR > 100, temp > 37.5 °C, SpO₂ < 95 (align with thesis draft).

### P3 — UI
| ID | Task | Output |
|----|------|--------|
| P3.1 | Auth.js + protected routes | Login / demo user |
| P3.2 | Dashboard: vitals + simple chart + **polling** (`fetch` + interval) | In-browser updates |
| P3.3 | Static “Thesis alignment” page | Map UI to chapters |
| P3.4 | Responsive, readable layout | Demo on projector |

### P4 — Alerts & medication (in-app only)
| ID | Task | Output |
|----|------|--------|
| P4.1 | On critical status, insert **Alert** rows | DB + API |
| P4.2 | **In-app** list / banner / unread state | No external notify |
| P4.3 | Medication CRUD (Server Actions) | Per-user schedules |
| P4.4 | Upcoming / missed dose UI | Derived from DB + optional Cron |

### P5 — Security
| ID | Task | Output |
|----|------|--------|
| P5.1 | Harden Auth.js + argon2/bcrypt | Secure sessions |
| P5.2 | Minimal RBAC (e.g. patient vs admin) | Permission helper |
| P5.3 | Rotate/document **INGEST_API_KEY**; never commit | README |
| P5.4 | `next.config` security headers | Document CSP trade-offs |

### P6 — Deploy
| ID | Task | Output |
|----|------|--------|
| P6.1 | Vercel project + Git | Preview + prod |
| P6.2 | One Next deploy (all routes) | Healthy URL |
| P6.3 | **Vercel Postgres (Neon)** wired in dashboard + migrate | Prod/preview schema on free tier |
| P6.4 | Vercel Cron (if used) + `CRON_SECRET` | Overdue sweeps |
| P6.5 | Low-rate simulator smoke test | E2E check |
| P6.6 | `doc/demo/` recording + screenshots | Offline backup |

---

## 7. Milestones

| ID | Gate |
|----|------|
| M1 | Simulator stable ≥10 min; Postgres shows readings + status |
| M2 | Dashboard matches DB for same user |
| M3 | One slide: sim → Edge route → **Neon (Vercel Postgres)** → in-app alerts → meds |
| M4 | Secrets only in Vercel; optional **Neon branch** per environment so Preview never writes to prod data |
| M5 | `doc/demo/` assets ready |

---

## 8. Vercel hosting

- **Previews:** every branch/PR gets a URL.
- **Env:** Dashboard + `vercel env pull`. Required: Postgres URLs, `AUTH_SECRET`, `AUTH_URL`, `INGEST_API_KEY`, optional `CRON_SECRET`.
- **Limits:** Keep Edge/Node handlers small; respect timeouts; expect cold starts—warm once before demos or use recordings in `doc/demo/`.
- **Observability:** Vercel logs only (no required APM deps).

### 8.1 Neon Postgres on Vercel (free tier)

- **Provisioning:** In the Vercel project, open **Storage** → create **Postgres**; Vercel wires **Neon** and injects connection env vars for **Production** / **Preview** / **Development** as you choose.
- **Managing:** Use Vercel’s Storage UI for quick access; use **Neon Console** for database branches, usage, and detailed connection pooling settings.
- **Free tier (thesis use):** Treat this as the **default deployment path**—no paid DB required for the demo. Keep storage small (prune old simulated readings in seeds/scripts if needed) and avoid long open transactions. **Exact quotas** (compute, storage, branches) change over time—confirm on **Vercel** and **Neon** pricing/docs when you provision.
- **Migrations:** Use the **non-pooling** / direct URL for `drizzle-kit migrate` (or equivalent) where Neon documents it; use the **pooled** `POSTGRES_URL` for the running Next.js app to avoid exhausting connections on serverless.

**Example `.env` names (illustrative — match what Vercel injects for Neon):**

```
POSTGRES_URL=
POSTGRES_URL_NON_POOLING=
AUTH_SECRET=
AUTH_URL=
INGEST_API_KEY=
CRON_SECRET=
```

### 8.2 Auth.js in production (session + protected APIs)

Protected Route Handlers use **Auth.js `auth()` as a wrapper** so `req.auth` is bound to the **incoming request** (plain `await auth()` inside handlers can miss cookies on Vercel and return 401 while the UI loads).

**Vercel Production checklist:**

1. **`AUTH_SECRET`** — set a long random value; **do not rotate** before demos without clearing cookies.
2. **`AUTH_URL`** — set to the **exact** canonical site URL with no trailing slash, e.g. `https://your-app.vercel.app`. Wrong origin breaks OAuth/callback-style flows and cookie scope for Auth.js v5.
3. **`POSTGRES_URL`** (or **`DATABASE_URL`**) — pooled URL for the running app.
4. After changing **`AUTH_SECRET`** or **`AUTH_URL`**, **clear site cookies** and sign in again.
5. Client **`fetch`** to same-origin APIs must use **`credentials: "include"`** (or default for same-origin GET in browsers, but explicit is safer for polling components).

---

## 9. Demo script

1. Architecture (30 s): sim → Edge ingest → **Neon Postgres (free tier)** → Next UI.
2. Log in on Vercel URL (15 s).
3. Run simulator; dashboard updates via polling (60 s).
4. Abnormal preset → status change → **in-app alert** surface (60 s).
5. Medication view + overdue/cues **in UI**; mention Cron if enabled (45 s).
6. Limitations from [Section 2](#2-scope-statement-for-viva--reports) (30 s).

---

## 10. Risks

| Risk | Mitigation |
|------|------------|
| Scope creep | Ship rules + UI first; defer non-essential features |
| “Where is edge?” | Show Edge `route.ts` + diagram + Vercel Edge docs |
| Edge can’t use DB driver | Spike early; narrow Edge to validate + rule evaluation, Node handler to persist if required |
| Demo flake | Short recording in `doc/demo/` |
| Neon **free tier** limits (storage, branches, compute) | Keep vitals retention small; one dev branch or shared Preview DB; check current limits before demo week |
| Weak “security story” | Auth.js, HTTPS, RBAC sketch, ingest secret—no PHI claims |

---

## 11. Thesis ↔ demo mapping

| Thesis theme | Demo |
|--------------|------|
| IoT | Simulator → ingest API |
| Edge | Edge Route Handler + `lib/edge` |
| Cloud | **Neon Postgres (Vercel Postgres)** + Server Actions / Route Handlers |
| Diagnosis | Rule-based vital thresholds → status |
| Alerts | DB + **in-app** UI only |
| Medication | CRUD + UI + optional Cron |
| Security | Auth.js, TLS, RBAC, ingest key |

---

## 12. First three actions

1. Bootstrap Next.js and connect **Vercel** (P0.1 + start P6.1).
2. In Vercel **Storage**, create **Postgres (Neon)** on the **free tier**; run Drizzle schema + migration + seed against **non-pooling** URL for migrate, **pooled** URL for the app (P1).
3. Edge ingest + `processVitals` + one chart + polling client (P2 + P3.2).

---

*Update this file when scope or dependencies change.*
