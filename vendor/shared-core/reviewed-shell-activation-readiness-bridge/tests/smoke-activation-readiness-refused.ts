import { runReviewedShellActivationReadinessBridge } from "../src/index.js";

const result = runReviewedShellActivationReadinessBridge({
  subjectId: "rar_003",
  receivingEnvironmentHandoff: {
    receivingEnvironmentHandoffId: "receiving_env_handoff_rar_003",
    subjectId: "rar_003",
    receivingEnvironmentHandoffStatus: "RECEIVING_ENVIRONMENT_HANDOFF_REFUSED",
    emissionId: "activated_tx_state_003",
    artifactTarget: "ReceivingEnvironment",
    liveSystemRecordEligible: false,
    reviewRequired: false,
    reason: "Refused.",
    createdAt: new Date().toISOString(),
  },
  reviewedShell: {
    reviewedShellId: "reviewed_shell_rar_003",
    subjectId: "rar_003",
    reviewedShellStatus: "REVIEWED_SHELL_APPROVED",
    shellApproved: true,
    reason: "Approved.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.activationReadinessStatus !== "ACTIVATION_REFUSED") {
  throw new Error("Expected refused receiving refusal.");
}

console.log("SMOKE_ACTIVATION_READINESS_REFUSED=PASS");