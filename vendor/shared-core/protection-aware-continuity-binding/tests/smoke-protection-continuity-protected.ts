import { runProtectionAwareContinuityBinding } from "../src/index.js";

const result = runProtectionAwareContinuityBinding({
  subjectId: "sub_621",
  protectiveState: {
    protectiveStateId: "dis2_state_flow_621",
    subjectId: "sub_621",
    sourceFlowId: "flow_621",
    protectiveState: "PROTECTED",
    reviewRequired: false,
    restorationVisible: false,
    reason: "Protected.",
    createdAt: new Date().toISOString(),
  },
  visibilityMeaning: {
    visibilityMeaningId: "safe_ai2_visibility_dis2_state_flow_621",
    subjectId: "sub_621",
    sourceProtectiveStateId: "dis2_state_flow_621",
    displayLabel: "Protected",
    reassuranceLevel: "high",
    actionPrompt: "No action needed.",
    userExplanation: "Your environment is protected and operating normally.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.consumerVisible !== true || result.artifact.continuityMessageClass !== "reassurance") {
  throw new Error("Expected consumer-visible protected reassurance.");
}

console.log("SMOKE_PROTECTION_CONTINUITY_PROTECTED=PASS");