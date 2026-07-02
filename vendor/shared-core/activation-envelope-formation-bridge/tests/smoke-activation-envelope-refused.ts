import { runActivationEnvelopeFormationBridge } from "../src/index.js";

const result = runActivationEnvelopeFormationBridge({
  subjectId: "aef_003",
  activationReadiness: {
    activationReadinessId: "activation_readiness_aef_003",
    subjectId: "aef_003",
    activationReadinessStatus: "ACTIVATION_REFUSED",
    receivingEnvironmentHandoffId: "receiving_003",
    reviewedShellId: "shell_003",
    activationEligible: false,
    reviewRequired: false,
    reason: "Refused.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.activationEnvelopeStatus !== "ACTIVATION_ENVELOPE_REFUSED") {
  throw new Error("Expected activation envelope refusal.");
}

console.log("SMOKE_ACTIVATION_ENVELOPE_REFUSED=PASS");