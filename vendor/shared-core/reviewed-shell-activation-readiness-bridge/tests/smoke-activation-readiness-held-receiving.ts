import { runReviewedShellActivationReadinessBridge } from "../src/index.js";

const result = runReviewedShellActivationReadinessBridge({
  subjectId: "rar_002",
  receivingEnvironmentHandoff: {
    receivingEnvironmentHandoffId: "receiving_env_handoff_rar_002",
    subjectId: "rar_002",
    receivingEnvironmentHandoffStatus: "RECEIVING_ENVIRONMENT_HANDOFF_HELD",
    emissionId: "activated_tx_state_002",
    artifactTarget: "ReceivingEnvironment",
    liveSystemRecordEligible: false,
    reviewRequired: true,
    reason: "Held.",
    createdAt: new Date().toISOString(),
  },
  reviewedShell: {
    reviewedShellId: "reviewed_shell_rar_002",
    subjectId: "rar_002",
    reviewedShellStatus: "REVIEWED_SHELL_APPROVED",
    shellApproved: true,
    reason: "Approved.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.activationReadinessStatus !== "ACTIVATION_HELD") {
  throw new Error("Expected held receiving hold.");
}

console.log("SMOKE_ACTIVATION_READINESS_HELD_RECEIVING=PASS");