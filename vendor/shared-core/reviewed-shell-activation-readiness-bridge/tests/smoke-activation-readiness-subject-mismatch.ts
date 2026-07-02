import { runReviewedShellActivationReadinessBridge } from "../src/index.js";

const result = runReviewedShellActivationReadinessBridge({
  subjectId: "rar_005",
  receivingEnvironmentHandoff: {
    receivingEnvironmentHandoffId: "receiving_env_handoff_rar_005",
    subjectId: "rar_005",
    receivingEnvironmentHandoffStatus: "RECEIVING_ENVIRONMENT_HANDOFF_READY",
    emissionId: "activated_tx_state_005",
    artifactTarget: "ReceivingEnvironment",
    liveSystemRecordEligible: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
  reviewedShell: {
    reviewedShellId: "reviewed_shell_rar_005",
    subjectId: "wrong_rar",
    reviewedShellStatus: "REVIEWED_SHELL_APPROVED",
    shellApproved: true,
    reason: "Approved.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_ACTIVATION_READINESS_SUBJECT_MISMATCH=PASS");