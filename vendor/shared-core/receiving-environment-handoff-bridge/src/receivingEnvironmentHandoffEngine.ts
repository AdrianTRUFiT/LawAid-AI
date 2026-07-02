import type {
  ReceivingEnvironmentHandoffArtifact,
  ReceivingEnvironmentHandoffInput,
  ReceivingEnvironmentHandoffResult,
  ReceivingEnvironmentHandoffStatus,
} from "./receivingEnvironmentHandoffTypes.js";
import {
  makeReceivingEnvironmentHandoffId,
  nowIso,
} from "./receivingEnvironmentHandoffUtils.js";

export function runReceivingEnvironmentHandoffBridge(
  input: ReceivingEnvironmentHandoffInput,
): ReceivingEnvironmentHandoffResult {
  if (!input.activatedTransactionStateEmission) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Receiving-environment handoff refused because Activated Transaction State emission input is missing.",
      },
    };
  }

  if (input.subjectId !== input.activatedTransactionStateEmission.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Receiving-environment handoff refused because subject identity does not match Activated Transaction State emission input.",
      },
    };
  }

  let receivingEnvironmentHandoffStatus: ReceivingEnvironmentHandoffStatus;
  let liveSystemRecordEligible = false;
  let reviewRequired = false;
  let reason = "";

  if (input.activatedTransactionStateEmission.activatedTransactionEmissionStatus === "ACTIVATED_TRANSACTION_STATE_REFUSED") {
    receivingEnvironmentHandoffStatus = "RECEIVING_ENVIRONMENT_HANDOFF_REFUSED";
    reason = "Activated Transaction State emission was refused, so receiving-environment handoff is refused.";
  } else if (input.activatedTransactionStateEmission.activatedTransactionEmissionStatus === "ACTIVATED_TRANSACTION_STATE_HELD") {
    receivingEnvironmentHandoffStatus = "RECEIVING_ENVIRONMENT_HANDOFF_HELD";
    reviewRequired = true;
    reason = "Activated Transaction State emission is held, so receiving-environment handoff remains held.";
  } else {
    receivingEnvironmentHandoffStatus = "RECEIVING_ENVIRONMENT_HANDOFF_READY";
    liveSystemRecordEligible = input.activatedTransactionStateEmission.transactTruthReady;
    reason = "Activated Transaction State emission is ready, so receiving-environment handoff may proceed.";
  }

  const artifact: ReceivingEnvironmentHandoffArtifact = {
    receivingEnvironmentHandoffId: makeReceivingEnvironmentHandoffId(input.subjectId),
    subjectId: input.subjectId,
    receivingEnvironmentHandoffStatus,
    emissionId: input.activatedTransactionStateEmission.activatedTransactionStateEmissionId,
    artifactTarget: "ReceivingEnvironment",
    liveSystemRecordEligible,
    reviewRequired,
    reason,
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}