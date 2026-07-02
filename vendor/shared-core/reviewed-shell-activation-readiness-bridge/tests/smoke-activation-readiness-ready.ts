import { runReviewedShellActivationReadinessBridge } from "../src/index.js";

const result = runReviewedShellActivationReadinessBridge({
  subjectId: "rar_001",
  receivingEnvironmentHandoff: {
    receivingEnvironmentHandoffId: "receiving_env_handoff_rar_001",
    subjectId: "rar_001",
    receivingEnvironmentHandoffStatus: "RECEIVING_ENVIRONMENT_HANDOFF_READY",
    emissionId: "activated_tx_state_001",
    artifactTarget: "ReceivingEnvironment",
    liveSystemRecordEligible: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
  reviewedShell: {
    reviewedShellId: "reviewed_shell_rar_001",
    subjectId: "rar_001",
    reviewedShellStatus: "REVIEWED_SHELL_APPROVED",
    shellApproved: true,
    reason: "Approved.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.activationReadinessStatus !== "ACTIVATION_READY") {
  throw new Error("Expected ready receiving + approved shell pass.");
}

console.log("SMOKE_ACTIVATION_READINESS_READY=PASS");