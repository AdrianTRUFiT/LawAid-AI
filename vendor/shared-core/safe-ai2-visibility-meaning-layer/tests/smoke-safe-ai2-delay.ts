import { runSafeAi2VisibilityMeaningLayer } from "../src/index.js";

const result = runSafeAi2VisibilityMeaningLayer({
  subjectId: "sub_613",
  protectiveState: {
    protectiveStateId: "dis2_state_flow_613",
    subjectId: "sub_613",
    sourceFlowId: "flow_613",
    protectiveState: "DELAYED_FOR_SAFETY",
    reviewRequired: true,
    restorationVisible: false,
    reason: "Delay path.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.displayLabel !== "Delayed for safety") {
  throw new Error("Expected Delayed for safety meaning.");
}

console.log("SMOKE_SAFE_AI2_DELAY=PASS");