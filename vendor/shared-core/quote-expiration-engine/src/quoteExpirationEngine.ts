import type {
  QuoteExpirationArtifact,
  QuoteExpirationInput,
  QuoteExpirationResult,
} from "./quoteExpirationTypes.js";
import {
  addSeconds,
  makeQuoteId,
  nowIso,
  secondsBetween,
} from "./quoteExpirationUtils.js";

export function runQuoteExpirationEngine(
  input: QuoteExpirationInput,
): QuoteExpirationResult {
  if (!input.paymentRail) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_PAYMENT_RAIL",
        refusalReason: "Quote expiration refused because payment rail artifact is missing.",
      },
    };
  }

  if (input.subjectId !== input.paymentRail.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Quote expiration refused because subjectId does not match payment rail subjectId.",
      },
    };
  }

  if (input.referenceRate <= 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_RATE",
        refusalReason: "Quote expiration refused because referenceRate must be positive.",
      },
    };
  }

  if (input.quoteWindowSeconds <= 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_WINDOW",
        refusalReason: "Quote expiration refused because quoteWindowSeconds must be positive.",
      },
    };
  }

  const quotedAt = input.createdAtIso ?? nowIso();
  const evaluationAt = input.evaluationAtIso ?? quotedAt;
  const expiresAt = addSeconds(quotedAt, input.quoteWindowSeconds);
  const ageSeconds = secondsBetween(quotedAt, evaluationAt);

  let quoteStatus: "LIVE" | "EXPIRED" | "REQUOTE_REQUIRED" | "TIMED_OUT";
  let requoteRequired = false;
  let policyReason = "";

  if (input.underpaymentDetected === true) {
    quoteStatus = "REQUOTE_REQUIRED";
    requoteRequired = true;
    policyReason = "Quote requires re-quote because underpayment or value mismatch was detected.";
  } else {
    quoteStatus = "LIVE";
    policyReason = "Quote remains live within lock window.";
  }

  if (input.paymentCompleted !== true) {
    if (ageSeconds > input.quoteWindowSeconds * 2) {
      quoteStatus = "TIMED_OUT";
      requoteRequired = true;
      policyReason = "Quote timed out because payment did not complete within extended window.";
    } else if (ageSeconds > input.quoteWindowSeconds) {
      quoteStatus = "EXPIRED";
      requoteRequired = true;
      policyReason = "Quote expired because lock window elapsed before payment completion.";
    }
  }

  const artifact: QuoteExpirationArtifact = {
    quoteId: makeQuoteId(input.paymentRail.paymentRailId),
    subjectId: input.subjectId,
    sourcePaymentRailId: input.paymentRail.paymentRailId,
    quotedAsset: input.paymentRail.asset,
    quotedCurrency: input.paymentRail.currency,
    referenceRate: input.referenceRate,
    quoteWindowSeconds: input.quoteWindowSeconds,
    quotedAt,
    expiresAt,
    quoteStatus,
    requoteRequired,
    policyReason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}