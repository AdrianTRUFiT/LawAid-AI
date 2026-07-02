import type {
  BookingIntentToTransactionIntentInput,
  BookingIntentToTransactionIntentResult,
  TransactionIntentCandidateArtifact,
  TransactionIntentCandidateStatus,
} from "./bookingIntentToTransactionIntentTypes.js";
import {
  makeTransactionIntentCandidateId,
  nowIso,
} from "./bookingIntentToTransactionIntentUtils.js";

export function runBookingIntentToTransactionIntentBridge(
  input: BookingIntentToTransactionIntentInput,
): BookingIntentToTransactionIntentResult {
  if (!input.verifiedBookingIntent) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Booking-intent to transaction-intent bridge refused because verified booking intent input is missing.",
      },
    };
  }

  if (input.subjectId !== input.verifiedBookingIntent.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Booking-intent to transaction-intent bridge refused because subject identity does not match verified booking intent input.",
      },
    };
  }

  if (!Number.isFinite(input.transactionAmountMinor) || input.transactionAmountMinor <= 0 || !input.currency) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_TRANSACTION",
        refusalReason: "Booking-intent to transaction-intent bridge refused because transaction amount or currency is invalid.",
      },
    };
  }

  let transactionIntentCandidateStatus: TransactionIntentCandidateStatus;
  let downstreamReviewRequired = false;
  let reason = "";

  if (input.verifiedBookingIntent.verifiedBookingIntentStatus === "VERIFIED_BOOKING_INTENT_REFUSED") {
    transactionIntentCandidateStatus = "TRANSACTION_INTENT_REFUSED";
    reason = "Verified booking intent was refused, so transaction intent is refused.";
  } else if (
    input.verifiedBookingIntent.verifiedBookingIntentStatus === "VERIFIED_BOOKING_INTENT_HELD" ||
    !input.paymentWindowOpen
  ) {
    transactionIntentCandidateStatus = "TRANSACTION_INTENT_HELD";
    downstreamReviewRequired = true;
    reason = "Verified booking intent is held or payment window is closed, so transaction intent remains held.";
  } else {
    transactionIntentCandidateStatus = "TRANSACTION_INTENT_READY";
    reason = "Verified booking intent is ready and payment window is open, so transaction intent may advance.";
  }

  const artifact: TransactionIntentCandidateArtifact = {
    transactionIntentCandidateId: makeTransactionIntentCandidateId(input.subjectId),
    subjectId: input.subjectId,
    transactionIntentCandidateStatus,
    bookingIntentId: input.verifiedBookingIntent.verifiedBookingIntentId,
    offerClass: input.verifiedBookingIntent.offerClass,
    transactionAmountMinor: input.transactionAmountMinor,
    currency: input.currency,
    downstreamReviewRequired,
    reason,
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}