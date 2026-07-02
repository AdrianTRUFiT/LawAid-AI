import type { TransactionIntentQualificationReviewArtifact } from "../../transaction-intent-qualification-review-gate/src/index.js";

export type FundTrackerHandoffCandidateStatus =
  | "FUNDTRACKER_HANDOFF_READY"
  | "FUNDTRACKER_HANDOFF_HELD"
  | "FUNDTRACKER_HANDOFF_REFUSED";

export interface FundTrackerHandoffCandidateInput {
  subjectId: string;
  transactionQualification: TransactionIntentQualificationReviewArtifact | null;
}

export interface FundTrackerHandoffCandidateArtifact {
  fundTrackerHandoffCandidateId: string;
  subjectId: string;
  fundTrackerHandoffCandidateStatus: FundTrackerHandoffCandidateStatus;
  transactionQualificationId: string;
  routeTarget: "FundTrackerAI";
  handoffReady: boolean;
  reviewRequired: boolean;
  reason: string;
  createdAt: string;
}

export interface FundTrackerHandoffCandidateRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface FundTrackerHandoffCandidateResult {
  ok: boolean;
  artifact: FundTrackerHandoffCandidateArtifact | null;
  refusal: FundTrackerHandoffCandidateRefusal | null;
}