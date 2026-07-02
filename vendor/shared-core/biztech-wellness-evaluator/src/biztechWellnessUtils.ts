import type { CompositeRecommendation } from "./biztechWellnessTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function recommendationFromComposite(score: number): CompositeRecommendation {
  if (score >= 0.8) return "best";
  if (score >= 0.6) return "acceptable";
  if (score >= 0.35) return "costly";
  return "destabilizing";
}