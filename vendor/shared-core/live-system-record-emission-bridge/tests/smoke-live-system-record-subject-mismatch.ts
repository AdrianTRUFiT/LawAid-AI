import { runLiveSystemRecordEmissionBridge } from "../src/index.js";

const result = runLiveSystemRecordEmissionBridge({
  subjectId: "lsr_005",
  activationEnvelope: {
    activationEnvelopeId: "activation_envelope_lsr_005",
    subjectId: "wrong_lsr",
    activationEnvelopeStatus: "ACTIVATION_ENVELOPE_READY",
    activationReadinessId: "activation_readiness_005",
    artifactType: "ActivationEnvelope",
    liveRecordCreationEligible: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_LIVE_SYSTEM_RECORD_SUBJECT_MISMATCH=PASS");