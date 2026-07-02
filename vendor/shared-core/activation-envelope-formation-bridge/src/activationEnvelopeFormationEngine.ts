import type {
  ActivationEnvelopeFormationArtifact,
  ActivationEnvelopeFormationInput,
  ActivationEnvelopeFormationResult,
  ActivationEnvelopeStatus,
} from "./activationEnvelopeFormationTypes.js";
import {
  makeActivationEnvelopeId,
  nowIso,
} from "./activationEnvelopeFormationUtils.js";

export function runActivationEnvelopeFormationBridge(
  input: ActivationEnvelopeFormationInput,
): ActivationEnvelopeFormationResult {
  if (!input.activationReadiness) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Activation Envelope formation refused because activation-readiness input is missing.",
      },
    };
  }

  if (input.subjectId !== input.activationReadiness.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Activation Envelope formation refused because subject identity does not match activation-readiness input.",
      },
    };
  }

  let activationEnvelopeStatus: ActivationEnvelopeStatus;
  let liveRecordCreationEligible = false;
  let reviewRequired = false;
  let reason = "";

  if (input.activationReadiness.activationReadinessStatus === "ACTIVATION_REFUSED") {
    activationEnvelopeStatus = "ACTIVATION_ENVELOPE_REFUSED";
    reason = "Activation readiness was refused, so Activation Envelope formation is refused.";
  } else if (input.activationReadiness.activationReadinessStatus === "ACTIVATION_HELD") {
    activationEnvelopeStatus = "ACTIVATION_ENVELOPE_HELD";
    reviewRequired = true;
    reason = "Activation readiness is held, so Activation Envelope formation remains held.";
  } else {
    activationEnvelopeStatus = "ACTIVATION_ENVELOPE_READY";
    liveRecordCreationEligible = input.activationReadiness.activationEligible;
    reason = "Activation readiness is ready, so Activation Envelope may form.";
  }

  const artifact: ActivationEnvelopeFormationArtifact = {
    activationEnvelopeId: makeActivationEnvelopeId(input.subjectId),
    subjectId: input.subjectId,
    activationEnvelopeStatus,
    activationReadinessId: input.activationReadiness.activationReadinessId,
    artifactType: "ActivationEnvelope",
    liveRecordCreationEligible,
    reviewRequired,
    reason,
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}