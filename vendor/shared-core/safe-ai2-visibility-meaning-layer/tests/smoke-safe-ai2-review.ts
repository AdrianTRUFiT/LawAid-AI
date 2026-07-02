import { runSafeAi2VisibilityMeaningLayer } from "../src/index.js";

const result = runSafeAi2VisibilityMeaningLayer({
  subjectId: "sub_612",
  protectiveState: {
    protectiveStateId: "dis2_state_flow_612",
    subjectId: "sub_612",
    sourceFlowId: "flow_612",
    protectiveState: "UNDER_REVIEW",
    reviewRequired: true,
    restorationVisible: false,
    reason: "Review path.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.displayLabel !== "Under review") {
  throw new Error("Expected Under review meaning.");
}

console.log("SMOKE_SAFE_AI2_REVIEW=PASS");