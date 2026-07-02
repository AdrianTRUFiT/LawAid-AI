import type {
  AnomalySeverity,
  ObservedAnomaly,
  SuspicionClass,
} from "./investigativeInferenceTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function severityWeight(value: AnomalySeverity): number {
  switch (value) {
    case "low": return 0.25;
    case "moderate": return 0.5;
    case "high": return 0.75;
    case "critical": return 1.0;
  }
}

export function suspicionClassFromPressure(
  pressureScore: number,
): SuspicionClass {
  if (pressureScore < 0.25) return "weak_signal";
  if (pressureScore < 0.5) return "developing_pressure";
  if (pressureScore < 0.7) return "corroborated_pressure";
  if (pressureScore < 0.9) return "instability_risk";
  return "transition_risk";
}

export function uniqueSourceCount(anomalies: ObservedAnomaly[]): number {
  return new Set(anomalies.map((x) => x.sourceId)).size;
}