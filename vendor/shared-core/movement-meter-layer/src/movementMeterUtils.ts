import type {
  HazardClass,
  MaturityClass,
  MovementDirection,
  MovementState,
  ViabilityClass,
} from "./movementMeterTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function expectedStaticTimeFromPnn(p_nn?: number): number | null {
  if (typeof p_nn !== "number" || !Number.isFinite(p_nn)) {
    return null;
  }

  if (p_nn >= 1) {
    return Number.POSITIVE_INFINITY;
  }

  if (p_nn < 0) {
    return null;
  }

  return 1 / (1 - p_nn);
}

export function normalizeDirection(value: string): MovementDirection {
  const normalized = value.trim().toLowerCase();

  if (normalized === "up") return "up";
  if (normalized === "down") return "down";
  if (normalized === "neutral") return "neutral";
  if (normalized === "unknown") return "unknown";

  return "unknown";
}

export function normalizeStateLabel(value: string): MovementState {
  const normalized = value.trim().toLowerCase();

  switch (normalized) {
    case "neutral_compression": return "neutral_compression";
    case "early_ascent": return "early_ascent";
    case "mid_ascent": return "mid_ascent";
    case "late_ascent": return "late_ascent";
    case "ascent_exhaustion_risk": return "ascent_exhaustion_risk";
    case "early_descent": return "early_descent";
    case "mid_descent": return "mid_descent";
    case "late_descent": return "late_descent";
    case "descent_exhaustion_risk": return "descent_exhaustion_risk";
    case "reversal_watch": return "reversal_watch";
    case "continuation_after_pause": return "continuation_after_pause";
    default: return "unknown_state";
  }
}

export function deriveMaturityClass(state: MovementState, ageBars: number): MaturityClass {
  if (state === "ascent_exhaustion_risk" || state === "descent_exhaustion_risk") {
    return "exhaustion_risk";
  }

  if (ageBars <= 3) return "early";
  if (ageBars <= 8) return "developing";
  return "late";
}

export function deriveViabilityClass(
  ageBars: number,
  anomalyScore: number,
): ViabilityClass {
  if (ageBars <= 3 && anomalyScore < 0.3) return "high";
  if (ageBars <= 8 && anomalyScore < 0.6) return "moderate";
  if (ageBars <= 14 && anomalyScore < 0.8) return "low";
  return "critical";
}

export function deriveHazardClass(
  ageBars: number,
  anomalyScore: number,
  maturityClass: MaturityClass,
): HazardClass {
  if (maturityClass === "exhaustion_risk") return "high";

  const score = ageBars * 0.05 + anomalyScore;

  if (score < 0.35) return "low";
  if (score < 0.65) return "guarded";
  if (score < 0.95) return "elevated";
  return "high";
}