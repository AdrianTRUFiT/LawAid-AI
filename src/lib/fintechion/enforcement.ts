import type { GovernedFinancialOversightState } from "./types";

export type OversightEnforcementAction =
  | "none"
  | "monitor"
  | "review"
  | "restrict";

export interface OversightEnforcementState {
  action: OversightEnforcementAction;
  reason: string;
  generatedAt: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function buildOversightEnforcementState(
  oversight: GovernedFinancialOversightState,
): OversightEnforcementState {
  const highSeverityCount = oversight.anomalyFlags.filter(
    (flag) => flag.severity === "high",
  ).length;

  if (highSeverityCount >= 2) {
    return {
      action: "restrict",
      reason: "Multiple high-severity anomalies detected.",
      generatedAt: nowIso(),
    };
  }

  if (highSeverityCount === 1) {
    return {
      action: "review",
      reason: "At least one high-severity anomaly detected.",
      generatedAt: nowIso(),
    };
  }

  if (oversight.anomalyFlags.length > 0) {
    return {
      action: "monitor",
      reason: "Non-critical anomalies detected; increased monitoring recommended.",
      generatedAt: nowIso(),
    };
  }

  return {
    action: "none",
    reason: "No anomaly-driven enforcement required.",
    generatedAt: nowIso(),
  };
}
