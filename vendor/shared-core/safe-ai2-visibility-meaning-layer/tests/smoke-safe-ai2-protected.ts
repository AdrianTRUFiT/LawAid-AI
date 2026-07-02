import { runSafeAi2VisibilityMeaningLayer } from "../src/index.js";

const result = runSafeAi2VisibilityMeaningLayer({
  subjectId: "sub_611",
  protectiveState: {
    protectiveStateId: "dis2_state_flow_611",
    subjectId: "sub_611",
    sourceFlowId: "flow_611",
    protectiveState: "PROTECTED",
    reviewRequired: false,
    restorationVisible: false,
    reason: "Protected path.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.displayLabel !== "Protected") {
  throw new Error("Expected Protected meaning.");
}

console.log("SMOKE_SAFE_AI2_PROTECTED=PASS");