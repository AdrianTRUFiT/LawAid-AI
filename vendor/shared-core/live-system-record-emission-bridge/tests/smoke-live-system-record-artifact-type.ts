import { runLiveSystemRecordEmissionBridge } from "../src/index.js";

const result = runLiveSystemRecordEmissionBridge({
  subjectId: "lsr_004",
  activationEnvelope: {
    activationEnvelopeId: "activation_envelope_lsr_004",
    subjectId: "lsr_004",
    activationEnvelopeStatus: "ACTIVATION_ENVELOPE_READY",
    activationReadinessId: "activation_readiness_004",
    artifactType: "ActivationEnvelope",
    liveRecordCreationEligible: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.artifactType !== "LiveSystemRecord") {
  throw new Error("Expected correct artifact emission target.");
}

console.log("SMOKE_LIVE_SYSTEM_RECORD_ARTIFACT_TYPE=PASS");