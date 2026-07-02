import { runLiveSystemRecordEmissionBridge } from "../src/index.js";

const result = runLiveSystemRecordEmissionBridge({
  subjectId: "lsr_002",
  activationEnvelope: {
    activationEnvelopeId: "activation_envelope_lsr_002",
    subjectId: "lsr_002",
    activationEnvelopeStatus: "ACTIVATION_ENVELOPE_HELD",
    activationReadinessId: "activation_readiness_002",
    artifactType: "ActivationEnvelope",
    liveRecordCreationEligible: false,
    reviewRequired: true,
    reason: "Held.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.liveSystemRecordEmissionStatus !== "LIVE_SYSTEM_RECORD_HELD") {
  throw new Error("Expected live record held hold.");
}

console.log("SMOKE_LIVE_SYSTEM_RECORD_HELD=PASS");