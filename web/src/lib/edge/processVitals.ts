export type HealthStatus = "normal" | "warning" | "critical";

export type VitalInput = {
  heartRateBpm: number;
  temperatureC: number;
  spo2Pct: number;
};

/**
 * Edge-style rule engine aligned with thesis draft thresholds
 * (HR > 100, temp > 37.5 °C, SpO₂ < 95).
 */
export function processVitals(input: VitalInput): {
  status: HealthStatus;
  reasons: string[];
} {
  const reasons: string[] = [];
  let weight = 0;

  if (input.heartRateBpm > 100) {
    reasons.push("Elevated heart rate");
    weight += 1;
  }
  if (input.temperatureC > 37.5) {
    reasons.push("Fever-range temperature");
    weight += 1;
  }
  if (input.spo2Pct < 95) {
    reasons.push("Low SpO₂");
    weight += 1;
  }

  const severe =
    input.spo2Pct < 90 ||
    input.heartRateBpm > 120 ||
    input.temperatureC > 39 ||
    weight >= 3;

  let status: HealthStatus = "normal";
  if (severe) status = "critical";
  else if (weight >= 1) status = "warning";

  return { status, reasons };
}
