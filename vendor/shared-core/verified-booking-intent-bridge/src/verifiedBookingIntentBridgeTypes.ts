import type { PreCommitmentOfferArtifact } from "../../pre-commitment-offer-formation/src/index.js";

export type VerifiedBookingIntentStatus =
  | "VERIFIED_BOOKING_INTENT_READY"
  | "VERIFIED_BOOKING_INTENT_HELD"
  | "VERIFIED_BOOKING_INTENT_REFUSED";

export interface VerifiedBookingIntentBridgeInput {
  subjectId: string;
  preCommitmentOffer: PreCommitmentOfferArtifact | null;
}

export interface VerifiedBookingIntentArtifact {
  verifiedBookingIntentId: string;
  subjectId: string;
  verifiedBookingIntentStatus: VerifiedBookingIntentStatus;
  offerId: string;
  offerClass: "pooled_offer" | "isolated_offer" | "none";
  downstreamTransactionEligible: boolean;
  reason: string;
  createdAt: string;
}

export interface VerifiedBookingIntentBridgeRefusal {
  refusalCode:
    | "MISSING_INPUT"
    | "SUBJECT_MISMATCH";
  refusalReason: string;
}

export interface VerifiedBookingIntentBridgeResult {
  ok: boolean;
  artifact: VerifiedBookingIntentArtifact | null;
  refusal: VerifiedBookingIntentBridgeRefusal | null;
}