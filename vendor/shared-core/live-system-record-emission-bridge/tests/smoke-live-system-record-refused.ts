import { runLiveSystemRecordEmissionBridge } from "../src/index.js";

const result = runLiveSystemRecordEmissionBridge({
  subjectId: "lsr_003",
  activationEnvelope: {
    activationEnvelopeId: "activation_envelope_lsr_003",
    subjectId: "lsr_003",
    activationEnvelopeStatus: "ACTIVATION_ENVELOPE_REFUSED",
    activationReadinessId: "activation_readiness_003",
    artifactType: "ActivationEnvelope",
    liveRecordCreationEligible: false,
    reviewRequired: false,
    reason: "Refused.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.liveSystemRecordEmissionStatus !== "LIVE_SYSTEM_RECORD_REFUSED") {
  throw new Error("Expected live record refused refusal.");
}

console.log("SMOKE_LIVE_SYSTEM_RECORD_REFUSED=PASS");