import type {
  ActivatedTransactionEmissionStatus,
  ActivatedTransactionStateEmissionArtifact,
  ActivatedTransactionStateEmissionInput,
  ActivatedTransactionStateEmissionResult,
} from "./activatedTransactionStateEmissionTypes.js";
import {
  makeActivatedTransactionStateEmissionId,
  nowIso,
} from "./activatedTransactionStateEmissionUtils.js";

export function runActivatedTransactionStateEmissionBridge(
  input: ActivatedTransactionStateEmissionInput,
): ActivatedTransactionStateEmissionResult {
  if (!input.fundTrackerIntake) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Activated Transaction State emission refused because FundTracker intake input is missing.",
      },
    };
  }

  if (input.subjectId !== input.fundTrackerIntake.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Activated Transaction State emission refused because subject identity does not match FundTracker intake input.",
      },
    };
  }

  let activatedTransactionEmissionStatus: ActivatedTransactionEmissionStatus;
  let transactTruthReady = false;
  let reviewRequired = false;
  let reason = "";

  if (input.fundTrackerIntake.fundTrackerIntakeStatus === "FUNDTRACKER_INTAKE_REFUSED") {
    activatedTransactionEmissionStatus = "ACTIVATED_TRANSACTION_STATE_REFUSED";
    reason = "FundTracker intake was refused, so Activated Transaction State emission is refused.";
  } else if (input.fundTrackerIntake.fundTrackerIntakeStatus === "FUNDTRACKER_INTAKE_HELD") {
    activatedTransactionEmissionStatus = "ACTIVATED_TRANSACTION_STATE_HELD";
    reviewRequired = true;
    reason = "FundTracker intake is held, so Activated Transaction State emission remains held.";
  } else {
    activatedTransactionEmissionStatus = "ACTIVATED_TRANSACTION_STATE_READY";
    transactTruthReady = input.fundTrackerIntake.normalizedForTransact;
    reason = "FundTracker intake is ready, so Activated Transaction State emission may proceed.";
  }

  const artifact: ActivatedTransactionStateEmissionArtifact = {
    activatedTransactionStateEmissionId: makeActivatedTransactionStateEmissionId(input.subjectId),
    subjectId: input.subjectId,
    activatedTransactionEmissionStatus,
    fundTrackerIntakeNormalizationId: input.fundTrackerIntake.fundTrackerIntakeNormalizationId,
    artifactType: "ActivatedTransactionState",
    transactTruthReady,
    reviewRequired,
    reason,
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}