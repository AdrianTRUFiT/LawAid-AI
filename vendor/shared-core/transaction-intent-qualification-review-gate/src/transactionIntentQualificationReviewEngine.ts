import type {
  TransactionIntentQualificationReviewArtifact,
  TransactionIntentQualificationReviewInput,
  TransactionIntentQualificationReviewResult,
  TransactionQualificationStatus,
} from "./transactionIntentQualificationReviewTypes.js";
import {
  makeTransactionQualificationId,
  nowIso,
} from "./transactionIntentQualificationReviewUtils.js";

export function runTransactionIntentQualificationReviewGate(
  input: TransactionIntentQualificationReviewInput,
): TransactionIntentQualificationReviewResult {
  if (!input.transactionIntentCandidate) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Transaction-intent qualification/review gate refused because transaction intent candidate input is missing.",
      },
    };
  }

  if (input.subjectId !== input.transactionIntentCandidate.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Transaction-intent qualification/review gate refused because subject identity does not match transaction intent candidate input.",
      },
    };
  }

  const scores = [input.riskScore, input.completenessScore];
  if (scores.some((s) => !Number.isFinite(s) || s < 0 || s > 1)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_SCORE",
        refusalReason: "Transaction-intent qualification/review gate refused because one or more scores are invalid.",
      },
    };
  }

  let transactionQualificationStatus: TransactionQualificationStatus;
  let reviewRequired = false;
  let reason = "";

  if (input.transactionIntentCandidate.transactionIntentCandidateStatus === "TRANSACTION_INTENT_REFUSED") {
    transactionQualificationStatus = "TRANSACTION_REFUSED";
    reason = "Transaction intent candidate was refused, so qualification is refused.";
  } else if (
    input.transactionIntentCandidate.transactionIntentCandidateStatus === "TRANSACTION_INTENT_HELD" ||
    input.riskScore >= 0.75 ||
    input.completenessScore < 0.6
  ) {
    transactionQualificationStatus = "TRANSACTION_REVIEW";
    reviewRequired = true;
    reason = "Transaction intent candidate is held, high-risk, or insufficiently complete, so review is required.";
  } else {
    transactionQualificationStatus = "TRANSACTION_QUALIFIED";
    reason = "Transaction intent candidate is sufficiently complete and low enough risk to qualify.";
  }

  const artifact: TransactionIntentQualificationReviewArtifact = {
    transactionQualificationId: makeTransactionQualificationId(input.subjectId),
    subjectId: input.subjectId,
    transactionQualificationStatus,
    transactionIntentCandidateId: input.transactionIntentCandidate.transactionIntentCandidateId,
    riskScore: input.riskScore,
    completenessScore: input.completenessScore,
    reviewRequired,
    reason,
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}