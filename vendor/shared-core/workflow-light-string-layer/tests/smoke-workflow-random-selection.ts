import { composeWorkflowLightString } from "../src/index.js";

const result = composeWorkflowLightString({
  scenarioId: "scenario_random_001",
  scenarioType: "generic",
  requestedLightIds: ["settlement", "oversight", "presentation"],
});

const requiredLights = result.workflow.lights.filter((x) => x.required).map((x) => x.lightId);

if (!requiredLights.includes("routing") || !requiredLights.includes("reservation") || !requiredLights.includes("settlement")) {
  throw new Error("Expected dependency expansion for random selection.");
}

console.log("SMOKE_WORKFLOW_RANDOM_SELECTION=PASS");