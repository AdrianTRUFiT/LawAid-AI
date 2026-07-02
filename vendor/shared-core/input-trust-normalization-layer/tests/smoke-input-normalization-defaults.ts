import { runInputTrustNormalization } from "../src/index.js";

const result = runInputTrustNormalization({
  bundleId: "bundle_defaults_001",
  scenarioId: "scenario_defaults_001",
  contributions: [
    {
      sourceId: "src_route",
      sourceClass: "route_origin",
      sourceAuthenticated: false,
      governanceVerified: false,
      variables: [
        { key: "origin", semanticType: "origin", value: "Dallas" },
        { key: "destination", semanticType: "destination", value: "Austin" },
      ],
    },
  ],
});

if (
  result.normalizedContext.localization.countryCode !== "US" ||
  result.normalizedContext.localization.languageCode !== "en" ||
  result.normalizedContext.localization.currencyCode !== "USD" ||
  result.normalizedContext.localization.unitSystem !== "imperial"
) {
  throw new Error("Expected default localization values.");
}

console.log("SMOKE_INPUT_NORMALIZATION_DEFAULTS=PASS");