import type { AnomalyFlag } from "./types";

export interface FinTechionRefusalState {
  allowed: boolean;
  reasons: string[];
  evaluatedAt: string;
}

export function buildOversightAllowedState(): FinTechionRefusalState {
  return {
    allowed: true,
    reasons: [],
    evaluatedAt: new Date().toISOString(),
  };
}

export function buildOversightRefusedState(
  reasons: string[],
): FinTechionRefusalState {
  return {
    allowed: false,
    reasons,
    evaluatedAt: new Date().toISOString(),
  };
}

export function anomaliesRequireReview(anomalies: AnomalyFlag[]): boolean {
  return anomalies.some((anomaly) => anomaly.severity === "high");
}
