import type {
  FundTrackerHandoffCandidateArtifact,
  FundTrackerHandoffCandidateInput,
  FundTrackerHandoffCandidateResult,
  FundTrackerHandoffCandidateStatus,
} from "./fundTrackerHandoffCandidateTypes.js";
import {
  makeFundTrackerHandoffCandidateId,
  nowIso,
} from "./fundTrackerHandoffCandidateUtils.js";

export function runFundTrackerHandoffCandidateBridge(
  input: FundTrackerHandoffCandidateInput,
): FundTrackerHandoffCandidateResult {
  if (!input.transactionQualification) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "FundTracker handoff candidate bridge refused because transaction qualification input is missing.",
      },
    };
  }

  if (input.subjectId !== input.transactionQualification.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "FundTracker handoff candidate bridge refused because subject identity does not match transaction qualification input.",
      },
    };
  }

  let fundTrackerHandoffCandidateStatus: FundTrackerHandoffCandidateStatus;
  let handoffReady = false;
  let reviewRequired = false;
  let reason = "";

  if (input.transactionQualification.transactionQualificationStatus === "TRANSACTION_REFUSED") {
    fundTrackerHandoffCandidateStatus = "FUNDTRACKER_HANDOFF_REFUSED";
    reason = "Transaction qualification was refused, so FundTracker handoff is refused.";
  } else if (input.transactionQualification.transactionQualificationStatus === "TRANSACTION_REVIEW") {
    fundTrackerHandoffCandidateStatus = "FUNDTRACKER_HANDOFF_HELD";
    reviewRequired = true;
    reason = "Transaction qualification requires review, so FundTracker handoff remains held.";
  } else {
    fundTrackerHandoffCandidateStatus = "FUNDTRACKER_HANDOFF_READY";
    handoffReady = true;
    reason = "Transaction qualification passed, so FundTracker handoff is ready.";
  }

  const artifact: FundTrackerHandoffCandidateArtifact = {
    fundTrackerHandoffCandidateId: makeFundTrackerHandoffCandidateId(input.subjectId),
    subjectId: input.subjectId,
    fundTrackerHandoffCandidateStatus,
    transactionQualificationId: input.transactionQualification.transactionQualificationId,
    routeTarget: "FundTrackerAI",
    handoffReady,
    reviewRequired,
    reason,
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}