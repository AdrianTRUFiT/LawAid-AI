import { runProtectionAwareContinuityBinding } from "../src/index.js";

const result = runProtectionAwareContinuityBinding({
  subjectId: "sub_625",
  protectiveState: {
    protectiveStateId: "dis2_state_flow_625",
    subjectId: "sub_625",
    sourceFlowId: "flow_625",
    protectiveState: "PROTECTED",
    reviewRequired: false,
    restorationVisible: false,
    reason: "Protected.",
    createdAt: new Date().toISOString(),
  },
  visibilityMeaning: {
    visibilityMeaningId: "safe_ai2_visibility_dis2_state_flow_625",
    subjectId: "wrong_sub",
    sourceProtectiveStateId: "dis2_state_flow_625",
    displayLabel: "Protected",
    reassuranceLevel: "high",
    actionPrompt: "No action needed.",
    userExplanation: "Protected.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_PROTECTION_CONTINUITY_MISMATCH=PASS");