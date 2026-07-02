import { runActivationEnvelopeFormationBridge } from "../src/index.js";

const result = runActivationEnvelopeFormationBridge({
  subjectId: "aef_004",
  activationReadiness: {
    activationReadinessId: "activation_readiness_aef_004",
    subjectId: "aef_004",
    activationReadinessStatus: "ACTIVATION_READY",
    receivingEnvironmentHandoffId: "receiving_004",
    reviewedShellId: "shell_004",
    activationEligible: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.artifactType !== "ActivationEnvelope") {
  throw new Error("Expected activation artifact target correctness.");
}

console.log("SMOKE_ACTIVATION_ENVELOPE_ARTIFACT_TYPE=PASS");