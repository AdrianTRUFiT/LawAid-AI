import { runActivationEnvelopeFormationBridge } from "../src/index.js";

const result = runActivationEnvelopeFormationBridge({
  subjectId: "aef_005",
  activationReadiness: {
    activationReadinessId: "activation_readiness_aef_005",
    subjectId: "wrong_aef",
    receivingEnvironmentHandoffId: "receiving_005",
    reviewedShellId: "shell_005",
    activationReadinessStatus: "ACTIVATION_READY",
    activationEligible: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_ACTIVATION_ENVELOPE_SUBJECT_MISMATCH=PASS");