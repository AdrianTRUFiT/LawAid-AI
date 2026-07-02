import type { FundTrackerHandoffCandidateArtifact } from "../../fundtracker-handoff-candidate-bridge/src/index.js";

export type FundTrackerIntakeStatus =
  | "FUNDTRACKER_INTAKE_READY"
  | "FUNDTRACKER_INTAKE_HELD"
  | "FUNDTRACKER_INTAKE_REFUSED";

export interface FundTrackerIntakeNormalizationInput {
  subjectId: string;
  fundTrackerHandoffCandidate: FundTrackerHandoffCandidateArtifact | null;
}

export interface FundTrackerIntakeNormalizationArtifact {
  fundTrackerIntakeNormalizationId: string;
  subjectId: string;
  fundTrackerIntakeStatus: FundTrackerIntakeStatus;
  handoffCandidateId: string;
  routeTarget: "FundTrackerAI";
  normalizedForTransact: boolean;
  reviewRequired: boolean;
  reason: string;
  createdAt: string;
}

export interface FundTrackerIntakeNormalizationRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH"
    | "INVALID_ROUTE_TARGET";
  refusalReason: string;
}

export interface FundTrackerIntakeNormalizationResult {
  ok: boolean;
  artifact: FundTrackerIntakeNormalizationArtifact | null;
  refusal: FundTrackerIntakeNormalizationRefusal | null;
}