import { composeWorkflowLightString } from "../src/index.js";

const result = composeWorkflowLightString({
  scenarioId: "scenario_local_001",
  scenarioType: "delivery_routing",
});

if (
  result.workflow.localization.countryCode !== "US" ||
  result.workflow.localization.languageCode !== "en" ||
  result.workflow.localization.currencyCode !== "USD"
) {
  throw new Error("Expected default localization values.");
}

console.log("SMOKE_WORKFLOW_LOCALIZATION_DEFAULTS=PASS");