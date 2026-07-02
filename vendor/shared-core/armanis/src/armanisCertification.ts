import type {
  CertificationLevel,
  ReadinessScores,
  ReadinessStatus
} from "./armanisContracts.js";

export const SCORE_CATEGORIES: readonly (keyof ReadinessScores)[] = Object.freeze([
  "aiGovernance",
  "dataCustody",
  "workflowTransferability",
  "authorizationClarity",
  "humanOverride",
  "auditability",
  "integrationReadiness",
  "negotiationPreparedness",
  "proofContinuity"
]);

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function averageScores(scores: ReadinessScores): number {
  const total = SCORE_CATEGORIES.reduce((sum, key) => sum + clampScore(scores[key]), 0);
  return Math.round(total / SCORE_CATEGORIES.length);
}

export function issueCertification(averageScore: number): CertificationLevel {
  if (averageScore >= 90) return "LEVEL_4_ACQUISITION_READY_INTELLIGENCE";
  if (averageScore >= 75) return "LEVEL_3_TRANSFER_READINESS";
  if (averageScore >= 60) return "LEVEL_2_CONTROL";
  return "LEVEL_1_VISIBILITY";
}

export function statusFromScore(averageScore: number, refusedReasons: string[], conditions: string[]): ReadinessStatus {
  if (refusedReasons.length > 0) return "REFUSED";
  if (averageScore < 50) return "NOT_AGENTIC_READY";
  if (averageScore < 65) return "HOLD_REMEDIATION_REQUIRED";
  if (conditions.length > 0) return "SAFE_WITH_CONDITIONS";
  return "SAFE_TO_ACQUIRE";
}