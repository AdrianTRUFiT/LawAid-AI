import { runProtectionAwareContinuityBinding } from "../src/index.js";

const result = runProtectionAwareContinuityBinding({
  subjectId: "sub_623",
  protectiveState: {
    protectiveStateId: "dis2_state_flow_623",
    subjectId: "sub_623",
    sourceFlowId: "flow_623",
    protectiveState: "RESTORED",
    reviewRequired: false,
    restorationVisible: true,
    reason: "Restored.",
    createdAt: new Date().toISOString(),
  },
  visibilityMeaning: {
    visibilityMeaningId: "safe_ai2_visibility_dis2_state_flow_623",
    subjectId: "sub_623",
    sourceProtectiveStateId: "dis2_state_flow_623",
    displayLabel: "Restored",
    reassuranceLevel: "high",
    actionPrompt: "You may continue.",
    userExplanation: "A protected state was restored successfully.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.consumerVisible !== true || result.artifact.continuityMessageClass !== "reassurance") {
  throw new Error("Expected shared visible restored reassurance.");
}

console.log("SMOKE_PROTECTION_CONTINUITY_RESTORED=PASS");