import type { TransactionIntentCandidateArtifact } from "../../booking-intent-to-transaction-intent-bridge/src/index.js";

export type TransactionQualificationStatus =
  | "TRANSACTION_QUALIFIED"
  | "TRANSACTION_REVIEW"
  | "TRANSACTION_REFUSED";

export interface TransactionIntentQualificationReviewInput {
  subjectId: string;
  transactionIntentCandidate: TransactionIntentCandidateArtifact | null;
  riskScore: number;
  completenessScore: number;
}

export interface TransactionIntentQualificationReviewArtifact {
  transactionQualificationId: string;
  subjectId: string;
  transactionQualificationStatus: TransactionQualificationStatus;
  transactionIntentCandidateId: string;
  riskScore: number;
  completenessScore: number;
  reviewRequired: boolean;
  reason: string;
  createdAt: string;
}

export interface TransactionIntentQualificationReviewRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH"
    | "INVALID_SCORE";
  refusalReason: string;
}

export interface TransactionIntentQualificationReviewResult {
  ok: boolean;
  artifact: TransactionIntentQualificationReviewArtifact | null;
  refusal: TransactionIntentQualificationReviewRefusal | null;
}