import { runLiveSystemRecordEmissionBridge } from "../src/index.js";

const result = runLiveSystemRecordEmissionBridge({
  subjectId: "lsr_001",
  activationEnvelope: {
    activationEnvelopeId: "activation_envelope_lsr_001",
    subjectId: "lsr_001",
    activationEnvelopeStatus: "ACTIVATION_ENVELOPE_READY",
    activationReadinessId: "activation_readiness_001",
    artifactType: "ActivationEnvelope",
    liveRecordCreationEligible: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.liveSystemRecordEmissionStatus !== "LIVE_SYSTEM_RECORD_READY") {
  throw new Error("Expected live record ready pass.");
}

console.log("SMOKE_LIVE_SYSTEM_RECORD_READY=PASS");