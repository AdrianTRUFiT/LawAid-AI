import { runProtectionAwareContinuityBinding } from "../src/index.js";

const result = runProtectionAwareContinuityBinding({
  subjectId: "sub_622",
  protectiveState: {
    protectiveStateId: "dis2_state_flow_622",
    subjectId: "sub_622",
    sourceFlowId: "flow_622",
    protectiveState: "UNDER_REVIEW",
    reviewRequired: true,
    restorationVisible: false,
    reason: "Review.",
    createdAt: new Date().toISOString(),
  },
  visibilityMeaning: {
    visibilityMeaningId: "safe_ai2_visibility_dis2_state_flow_622",
    subjectId: "sub_622",
    sourceProtectiveStateId: "dis2_state_flow_622",
    displayLabel: "Under review",
    reassuranceLevel: "medium",
    actionPrompt: "Please wait while protection checks complete.",
    userExplanation: "A safety review is in progress.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.consumerVisible !== false || result.artifact.continuityMessageClass !== "operator_review") {
  throw new Error("Expected operator-only review binding.");
}

console.log("SMOKE_PROTECTION_CONTINUITY_REVIEW=PASS");