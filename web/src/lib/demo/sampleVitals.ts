/** In-browser demo / server demo tick: same “normal” variance as scripts/simulate.ts */
export function sampleVitalsNormal() {
  return {
    heartRateBpm: 72 + Math.floor(Math.random() * 8),
    temperatureC: 36.5 + Math.random() * 0.6,
    spo2Pct: 96 + Math.floor(Math.random() * 3),
  };
}

export function sampleVitalsAbnormal() {
  return {
    heartRateBpm: 118,
    temperatureC: 38.2,
    spo2Pct: 91,
  };
}
