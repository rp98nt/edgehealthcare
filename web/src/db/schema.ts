import {
  boolean,
  integer,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/** Demo users — Credentials + JWT session (no adapter session tables). */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("patient"), // patient | admin
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const readings = pgTable("readings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  heartRateBpm: integer("heart_rate_bpm").notNull(),
  temperatureC: real("temperature_c").notNull(),
  spo2Pct: integer("spo2_pct").notNull(),
  bpSys: integer("bp_sys"),
  bpDia: integer("bp_dia"),
  status: text("status").notNull(), // normal | warning | critical
  reasonsJson: text("reasons_json"), // JSON array of strings
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const alerts = pgTable("alerts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  readingId: uuid("reading_id").references(() => readings.id, {
    onDelete: "set null",
  }),
  severity: text("severity").notNull(), // warning | critical
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const medications = pgTable("medications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  intervalHours: integer("interval_hours").notNull(),
  /** When the next dose is due (demo schedule anchor). */
  nextDueAt: timestamp("next_due_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const processingEvents = pgTable("processing_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  readingId: uuid("reading_id"),
  stage: text("stage").notNull(),
  detail: text("detail"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type Reading = typeof readings.$inferSelect;
export type Alert = typeof alerts.$inferSelect;
export type Medication = typeof medications.$inferSelect;
