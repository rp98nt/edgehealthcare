import { z } from "zod";

export const ingestBodySchema = z.object({
  userId: z.string().uuid(),
  heartRateBpm: z.number().int().min(30).max(240),
  temperatureC: z.number().min(32).max(45),
  spo2Pct: z.number().int().min(60).max(100),
  bpSys: z.number().int().min(40).max(250).optional(),
  bpDia: z.number().int().min(30).max(200).optional(),
  recordedAt: z.string().datetime().optional(),
});

export type IngestBody = z.infer<typeof ingestBodySchema>;
