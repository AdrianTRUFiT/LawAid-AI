import { composeWorkflowLightString } from "../src/index.js";

const result = composeWorkflowLightString({
  scenarioId: "scenario_travel_001",
  scenarioType: "travel_booking",
});

if (!result.workflow.fullyIlluminated) {
  throw new Error("Expected travel workflow to be fully illuminated.");
}

console.log("SMOKE_WORKFLOW_DEFAULT_TRAVEL=PASS");