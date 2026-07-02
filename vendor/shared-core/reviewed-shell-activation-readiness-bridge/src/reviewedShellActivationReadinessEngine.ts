import type {
  ReviewedShellActivationReadinessArtifact,
  ReviewedShellActivationReadinessInput,
  ReviewedShellActivationReadinessResult,
  ActivationReadinessStatus,
} from "./reviewedShellActivationReadinessTypes.js";
import {
  makeActivationReadinessId,
  nowIso,
} from "./reviewedShellActivationReadinessUtils.js";

export function runReviewedShellActivationReadinessBridge(
  input: ReviewedShellActivationReadinessInput,
): ReviewedShellActivationReadinessResult {
  if (!input.receivingEnvironmentHandoff || !input.reviewedShell) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Activation readiness refused because receiving-environment handoff or reviewed shell input is missing.",
      },
    };
  }

  if (
    input.subjectId !== input.receivingEnvironmentHandoff.subjectId ||
    input.subjectId !== input.reviewedShell.subjectId
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Activation readiness refused because subject identity does not match across inputs.",
      },
    };
  }

  let activationReadinessStatus: ActivationReadinessStatus;
  let activationEligible = false;
  let reviewRequired = false;
  let reason = "";

  if (input.receivingEnvironmentHandoff.receivingEnvironmentHandoffStatus === "RECEIVING_ENVIRONMENT_HANDOFF_REFUSED" || input.reviewedShell.reviewedShellStatus === "REVIEWED_SHELL_REFUSED") {
    activationReadinessStatus = "ACTIVATION_REFUSED";
    reason = "Receiving handoff or reviewed shell was refused, so activation readiness is refused.";
  } else if (
    input.receivingEnvironmentHandoff.receivingEnvironmentHandoffStatus === "RECEIVING_ENVIRONMENT_HANDOFF_HELD" ||
    input.reviewedShell.reviewedShellStatus !== "REVIEWED_SHELL_APPROVED" ||
    !input.reviewedShell.shellApproved
  ) {
    activationReadinessStatus = "ACTIVATION_HELD";
    reviewRequired = true;
    reason = "Receiving handoff is held or reviewed shell is not approved, so activation readiness remains held.";
  } else {
    activationReadinessStatus = "ACTIVATION_READY";
    activationEligible = input.receivingEnvironmentHandoff.liveSystemRecordEligible;
    reason = "Receiving handoff is ready and reviewed shell is approved, so activation readiness may proceed.";
  }

  const artifact: ReviewedShellActivationReadinessArtifact = {
    activationReadinessId: makeActivationReadinessId(input.subjectId),
    subjectId: input.subjectId,
    activationReadinessStatus,
    receivingEnvironmentHandoffId: input.receivingEnvironmentHandoff.receivingEnvironmentHandoffId,
    reviewedShellId: input.reviewedShell.reviewedShellId,
    activationEligible,
    reviewRequired,
    reason,
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}