import { runSafeAi2VisibilityMeaningLayer } from "../src/index.js";

const result = runSafeAi2VisibilityMeaningLayer({
  subjectId: "sub_615",
  protectiveState: {
    protectiveStateId: "dis2_state_flow_615",
    subjectId: "sub_615",
    sourceFlowId: "flow_615",
    protectiveState: "BLOCKED",
    reviewRequired: true,
    restorationVisible: false,
    reason: "Blocked path.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.displayLabel !== "Blocked with reason") {
  throw new Error("Expected Blocked meaning.");
}

console.log("SMOKE_SAFE_AI2_BLOCKED=PASS");