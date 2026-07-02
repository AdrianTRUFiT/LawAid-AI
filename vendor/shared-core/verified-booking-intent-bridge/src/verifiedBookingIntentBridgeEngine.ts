import type {
  VerifiedBookingIntentArtifact,
  VerifiedBookingIntentBridgeInput,
  VerifiedBookingIntentBridgeResult,
  VerifiedBookingIntentStatus,
} from "./verifiedBookingIntentBridgeTypes.js";
import {
  makeVerifiedBookingIntentId,
  nowIso,
} from "./verifiedBookingIntentBridgeUtils.js";

export function runVerifiedBookingIntentBridge(
  input: VerifiedBookingIntentBridgeInput,
): VerifiedBookingIntentBridgeResult {
  if (!input.preCommitmentOffer) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Verified booking-intent bridge refused because pre-commitment offer input is missing.",
      },
    };
  }

  if (input.subjectId !== input.preCommitmentOffer.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Verified booking-intent bridge refused because subject identity does not match pre-commitment offer input.",
      },
    };
  }

  let verifiedBookingIntentStatus: VerifiedBookingIntentStatus;
  let downstreamTransactionEligible = false;
  let reason = "";

  if (input.preCommitmentOffer.preCommitmentOfferStatus === "OFFER_REFUSED") {
    verifiedBookingIntentStatus = "VERIFIED_BOOKING_INTENT_REFUSED";
    reason = "Offer was refused, so verified booking intent is refused.";
  } else if (
    input.preCommitmentOffer.preCommitmentOfferStatus === "OFFER_HELD" ||
    !input.preCommitmentOffer.commitmentWindowOpen
  ) {
    verifiedBookingIntentStatus = "VERIFIED_BOOKING_INTENT_HELD";
    reason = "Offer is held or commitment window is closed, so verified booking intent remains held.";
  } else {
    verifiedBookingIntentStatus = "VERIFIED_BOOKING_INTENT_READY";
    downstreamTransactionEligible = true;
    reason = "Offer is ready and commitment window is open, so verified booking intent is ready.";
  }

  const artifact: VerifiedBookingIntentArtifact = {
    verifiedBookingIntentId: makeVerifiedBookingIntentId(input.subjectId),
    subjectId: input.subjectId,
    verifiedBookingIntentStatus,
    offerId: input.preCommitmentOffer.preCommitmentOfferId,
    offerClass: input.preCommitmentOffer.offerClass,
    downstreamTransactionEligible,
    reason,
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}