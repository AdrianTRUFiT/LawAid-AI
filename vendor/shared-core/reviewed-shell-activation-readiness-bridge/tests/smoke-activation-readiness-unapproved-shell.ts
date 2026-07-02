import { runReviewedShellActivationReadinessBridge } from "../src/index.js";

const result = runReviewedShellActivationReadinessBridge({
  subjectId: "rar_004",
  receivingEnvironmentHandoff: {
    receivingEnvironmentHandoffId: "receiving_env_handoff_rar_004",
    subjectId: "rar_004",
    receivingEnvironmentHandoffStatus: "RECEIVING_ENVIRONMENT_HANDOFF_READY",
    emissionId: "activated_tx_state_004",
    artifactTarget: "ReceivingEnvironment",
    liveSystemRecordEligible: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
  reviewedShell: {
    reviewedShellId: "reviewed_shell_rar_004",
    subjectId: "rar_004",
    reviewedShellStatus: "REVIEWED_SHELL_PENDING",
    shellApproved: false,
    reason: "Pending.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.activationReadinessStatus !== "ACTIVATION_HELD") {
  throw new Error("Expected unapproved shell hold.");
}

console.log("SMOKE_ACTIVATION_READINESS_UNAPPROVED_SHELL=PASS");