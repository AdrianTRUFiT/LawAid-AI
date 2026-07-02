import { composeWorkflowLightString } from "../src/index.js";

const result = composeWorkflowLightString({
  scenarioId: "scenario_override_001",
  scenarioType: "cross_border_flow",
  localization: {
    countryCode: "FR",
    languageCode: "fr",
    currencyCode: "EUR",
    unitSystem: "metric",
    locale: "fr-FR",
  },
});

if (
  result.workflow.localization.countryCode !== "FR" ||
  result.workflow.localization.languageCode !== "fr" ||
  result.workflow.localization.currencyCode !== "EUR"
) {
  throw new Error("Expected localization override values.");
}

console.log("SMOKE_WORKFLOW_LOCALIZATION_OVERRIDE=PASS");