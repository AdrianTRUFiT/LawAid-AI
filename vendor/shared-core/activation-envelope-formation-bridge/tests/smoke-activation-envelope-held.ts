import { runActivationEnvelopeFormationBridge } from "../src/index.js";

const result = runActivationEnvelopeFormationBridge({
  subjectId: "aef_002",
  activationReadiness: {
    activationReadinessId: "activation_readiness_aef_002",
    subjectId: "aef_002",
    activationReadinessStatus: "ACTIVATION_HELD",
    receivingEnvironmentHandoffId: "receiving_002",
    reviewedShellId: "shell_002",
    activationEligible: false,
    reviewRequired: true,
    reason: "Held.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.activationEnvelopeStatus !== "ACTIVATION_ENVELOPE_HELD") {
  throw new Error("Expected held activation envelope hold.");
}

console.log("SMOKE_ACTIVATION_ENVELOPE_HELD=PASS");