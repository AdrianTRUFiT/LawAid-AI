import type { VerifiedBookingIntentArtifact } from "../../verified-booking-intent-bridge/src/index.js";

export type TransactionIntentCandidateStatus =
  | "TRANSACTION_INTENT_READY"
  | "TRANSACTION_INTENT_HELD"
  | "TRANSACTION_INTENT_REFUSED";

export interface BookingIntentToTransactionIntentInput {
  subjectId: string;
  verifiedBookingIntent: VerifiedBookingIntentArtifact | null;
  transactionAmountMinor: number;
  currency: string;
  paymentWindowOpen: boolean;
}

export interface TransactionIntentCandidateArtifact {
  transactionIntentCandidateId: string;
  subjectId: string;
  transactionIntentCandidateStatus: TransactionIntentCandidateStatus;
  bookingIntentId: string;
  offerClass: "pooled_offer" | "isolated_offer" | "none";
  transactionAmountMinor: number;
  currency: string;
  downstreamReviewRequired: boolean;
  reason: string;
  createdAt: string;
}

export interface BookingIntentToTransactionIntentRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH"
    | "INVALID_TRANSACTION";
  refusalReason: string;
}

export interface BookingIntentToTransactionIntentResult {
  ok: boolean;
  artifact: TransactionIntentCandidateArtifact | null;
  refusal: BookingIntentToTransactionIntentRefusal | null;
}