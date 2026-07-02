import { runProtectionAwareContinuityBinding } from "../src/index.js";

const result = runProtectionAwareContinuityBinding({
  subjectId: "sub_624",
  protectiveState: {
    protectiveStateId: "dis2_state_flow_624",
    subjectId: "sub_624",
    sourceFlowId: "flow_624",
    protectiveState: "BLOCKED",
    reviewRequired: true,
    restorationVisible: false,
    reason: "Blocked.",
    createdAt: new Date().toISOString(),
  },
  visibilityMeaning: {
    visibilityMeaningId: "safe_ai2_visibility_dis2_state_flow_624",
    subjectId: "sub_624",
    sourceProtectiveStateId: "dis2_state_flow_624",
    displayLabel: "Blocked with reason",
    reassuranceLevel: "low",
    actionPrompt: "Review the reason and follow the guided recovery path.",
    userExplanation: "The system blocked this path to prevent unsafe consequence.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.continuityMessageClass !== "action_required") {
  throw new Error("Expected blocked action-required binding.");
}

console.log("SMOKE_PROTECTION_CONTINUITY_BLOCKED=PASS");