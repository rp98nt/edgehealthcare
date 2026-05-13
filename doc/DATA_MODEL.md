# Data model (Drizzle / Postgres)

## `users`

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `name` | text | |
| `email` | text unique | Login |
| `password_hash` | text | `bcryptjs` hash |
| `role` | text | `patient` / `admin` |
| `created_at` | timestamptz | |

## `readings`

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | |
| `heart_rate_bpm` | int | |
| `temperature_c` | real | °C |
| `spo2_pct` | int | |
| `bp_sys`, `bp_dia` | int nullable | |
| `status` | text | `normal` / `warning` / `critical` |
| `reasons_json` | text | JSON array of rule hits |
| `recorded_at` | timestamptz | When sample was “taken” |
| `created_at` | timestamptz | Insert time |

## `alerts`

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `user_id` | UUID FK | |
| `reading_id` | UUID FK nullable | Source reading |
| `severity` | text | `warning` / `critical` |
| `message` | text | |
| `read` | boolean | In-app read state |
| `created_at` | timestamptz | |

## `medications`

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `user_id` | UUID FK | |
| `name` | text | |
| `dosage` | text | Free text |
| `interval_hours` | int | Hours between doses |
| `next_due_at` | timestamptz | Updated on “Mark taken” |
| `created_at` | timestamptz | |

## `processing_events` (trace)

| Column | Type | Notes |
|--------|------|--------|
| `id` | UUID PK | |
| `user_id` | UUID FK | |
| `reading_id` | UUID nullable | |
| `stage` | text | e.g. `edge` |
| `detail` | text | JSON string |
| `created_at` | timestamptz | |
