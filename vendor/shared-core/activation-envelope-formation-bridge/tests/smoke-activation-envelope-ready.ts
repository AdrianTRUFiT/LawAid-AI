import { runActivationEnvelopeFormationBridge } from "../src/index.js";

const result = runActivationEnvelopeFormationBridge({
  subjectId: "aef_001",
  activationReadiness: {
    activationReadinessId: "activation_readiness_aef_001",
    subjectId: "aef_001",
    activationReadinessStatus: "ACTIVATION_READY",
    receivingEnvironmentHandoffId: "receiving_001",
    reviewedShellId: "shell_001",
    activationEligible: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.activationEnvelopeStatus !== "ACTIVATION_ENVELOPE_READY") {
  throw new Error("Expected activation envelope ready pass.");
}

console.log("SMOKE_ACTIVATION_ENVELOPE_READY=PASS");