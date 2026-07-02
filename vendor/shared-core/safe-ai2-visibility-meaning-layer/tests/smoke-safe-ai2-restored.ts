import { runSafeAi2VisibilityMeaningLayer } from "../src/index.js";

const result = runSafeAi2VisibilityMeaningLayer({
  subjectId: "sub_614",
  protectiveState: {
    protectiveStateId: "dis2_state_flow_614",
    subjectId: "sub_614",
    sourceFlowId: "flow_614",
    protectiveState: "RESTORED",
    reviewRequired: false,
    restorationVisible: true,
    reason: "Restored path.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.displayLabel !== "Restored") {
  throw new Error("Expected Restored meaning.");
}

console.log("SMOKE_SAFE_AI2_RESTORED=PASS");