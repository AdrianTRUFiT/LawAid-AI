import type {
  LiveSystemRecordEmissionArtifact,
  LiveSystemRecordEmissionInput,
  LiveSystemRecordEmissionResult,
  LiveSystemRecordEmissionStatus,
} from "./liveSystemRecordEmissionTypes.js";
import {
  makeLiveSystemRecordEmissionId,
  nowIso,
} from "./liveSystemRecordEmissionUtils.js";

export function runLiveSystemRecordEmissionBridge(
  input: LiveSystemRecordEmissionInput,
): LiveSystemRecordEmissionResult {
  if (!input.activationEnvelope) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Live System Record emission refused because Activation Envelope input is missing.",
      },
    };
  }

  if (input.subjectId !== input.activationEnvelope.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Live System Record emission refused because subject identity does not match Activation Envelope input.",
      },
    };
  }

  let liveSystemRecordEmissionStatus: LiveSystemRecordEmissionStatus;
  let emissionReady = false;
  let reviewRequired = false;
  let reason = "";

  if (input.activationEnvelope.activationEnvelopeStatus === "ACTIVATION_ENVELOPE_REFUSED") {
    liveSystemRecordEmissionStatus = "LIVE_SYSTEM_RECORD_REFUSED";
    reason = "Activation Envelope was refused, so Live System Record emission is refused.";
  } else if (input.activationEnvelope.activationEnvelopeStatus === "ACTIVATION_ENVELOPE_HELD") {
    liveSystemRecordEmissionStatus = "LIVE_SYSTEM_RECORD_HELD";
    reviewRequired = true;
    reason = "Activation Envelope is held, so Live System Record emission remains held.";
  } else {
    liveSystemRecordEmissionStatus = "LIVE_SYSTEM_RECORD_READY";
    emissionReady = input.activationEnvelope.liveRecordCreationEligible;
    reason = "Activation Envelope is ready, so Live System Record emission may proceed.";
  }

  const artifact: LiveSystemRecordEmissionArtifact = {
    liveSystemRecordEmissionId: makeLiveSystemRecordEmissionId(input.subjectId),
    subjectId: input.subjectId,
    liveSystemRecordEmissionStatus,
    activationEnvelopeId: input.activationEnvelope.activationEnvelopeId,
    artifactType: "LiveSystemRecord",
    emissionReady,
    reviewRequired,
    reason,
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}