import type { FundTrackerIntakeNormalizationArtifact } from "../../fundtracker-intake-normalization-bridge/src/index.js";

export type ActivatedTransactionEmissionStatus =
  | "ACTIVATED_TRANSACTION_STATE_READY"
  | "ACTIVATED_TRANSACTION_STATE_HELD"
  | "ACTIVATED_TRANSACTION_STATE_REFUSED";

export interface ActivatedTransactionStateEmissionInput {
  subjectId: string;
  fundTrackerIntake: FundTrackerIntakeNormalizationArtifact | null;
}

export interface ActivatedTransactionStateEmissionArtifact {
  activatedTransactionStateEmissionId: string;
  subjectId: string;
  activatedTransactionEmissionStatus: ActivatedTransactionEmissionStatus;
  fundTrackerIntakeNormalizationId: string;
  artifactType: "ActivatedTransactionState";
  transactTruthReady: boolean;
  reviewRequired: boolean;
  reason: string;
  createdAt: string;
}

export interface ActivatedTransactionStateEmissionRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface ActivatedTransactionStateEmissionResult {
  ok: boolean;
  artifact: ActivatedTransactionStateEmissionArtifact | null;
  refusal: ActivatedTransactionStateEmissionRefusal | null;
}