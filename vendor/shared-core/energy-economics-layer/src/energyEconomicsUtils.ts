import type {
  CognitiveLoadClass,
  DepletionRiskClass,
  StabilityBalanceClass,
} from "./energyEconomicsTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function classifyCognitiveLoad(score: number): CognitiveLoadClass {
  if (score < 0.25) return "low";
  if (score < 0.5) return "guarded";
  if (score < 0.75) return "elevated";
  return "high";
}

export function classifyDepletionRisk(score: number): DepletionRiskClass {
  if (score < 0.25) return "low";
  if (score < 0.5) return "guarded";
  if (score < 0.75) return "elevated";
  return "high";
}

export function classifyStabilityBalance(score: number): StabilityBalanceClass {
  if (score >= 0.75) return "stable";
  if (score >= 0.5) return "strained";
  if (score >= 0.25) return "imbalanced";
  return "depleted";
}