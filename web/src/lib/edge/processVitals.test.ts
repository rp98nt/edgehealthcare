import { describe, expect, it } from "vitest";
import { processVitals } from "./processVitals";

describe("processVitals", () => {
  it("returns normal for ideal vitals", () => {
    const r = processVitals({
      heartRateBpm: 72,
      temperatureC: 36.8,
      spo2Pct: 98,
    });
    expect(r.status).toBe("normal");
    expect(r.reasons.length).toBe(0);
  });

  it("flags warning for single threshold breach", () => {
    const r = processVitals({
      heartRateBpm: 105,
      temperatureC: 36.5,
      spo2Pct: 98,
    });
    expect(r.status).toBe("warning");
    expect(r.reasons.some((x) => x.includes("heart"))).toBe(true);
  });

  it("flags critical for very low SpO₂", () => {
    const r = processVitals({
      heartRateBpm: 80,
      temperatureC: 36.5,
      spo2Pct: 88,
    });
    expect(r.status).toBe("critical");
  });

  it("flags critical for multiple moderate issues", () => {
    const r = processVitals({
      heartRateBpm: 105,
      temperatureC: 38.0,
      spo2Pct: 94,
    });
    expect(r.status).toBe("critical");
  });
});
