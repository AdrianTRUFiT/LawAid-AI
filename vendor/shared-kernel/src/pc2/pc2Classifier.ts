import type { DecisionTypeSelector, PatternClassifier } from "./pc2Types.js";
import type { PainSeverity } from "./pc2Contracts.js";

export function classifySeverity(description: string): PainSeverity {
  const normalized = description.toLowerCase();

  if (
    normalized.includes("break") ||
    normalized.includes("fail") ||
    normalized.includes("error") ||
    normalized.includes("drift")
  ) {
    return "high";
  }

  if (
    normalized.includes("confus") ||
    normalized.includes("slow") ||
    normalized.includes("manual")
  ) {
    return "moderate";
  }

  return "low";
}

export const defaultPatternClassifier: PatternClassifier = (
  description,
  repeatedSignals
) => {
  const normalized = `${description} ${repeatedSignals.join(" ")}`.toLowerCase();

  if (normalized.includes("route") || normalized.includes("handoff")) {
    return { inferredPattern: "routing_friction", confidence: 0.87 };
  }

  if (normalized.includes("shape") || normalized.includes("contract")) {
    return { inferredPattern: "contract_instability", confidence: 0.85 };
  }

  if (normalized.includes("copy") || normalized.includes("duplicate")) {
    return { inferredPattern: "duplication_drift", confidence: 0.83 };
  }

  return { inferredPattern: "general_operational_friction", confidence: 0.71 };
};

export const defaultDecisionTypeSelector: DecisionTypeSelector = (description) => {
  const normalized = description.toLowerCase();

  if (normalized.includes("contract") || normalized.includes("schema")) {
    return "contract_change";
  }

  if (normalized.includes("flow") || normalized.includes("handoff")) {
    return "workflow_change";
  }

  if (normalized.includes("screen") || normalized.includes("panel")) {
    return "ui_change";
  }

  if (normalized.includes("nothing to build") || normalized.includes("no build")) {
    return "no_build";
  }

  return "file_change";
};
