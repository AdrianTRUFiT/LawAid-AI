import { runInputTrustNormalization } from "../src/index.js";

const result = runInputTrustNormalization({
  bundleId: "bundle_override_001",
  scenarioId: "scenario_override_001",
  contributions: [
    {
      sourceId: "src_route",
      sourceClass: "route_origin",
      sourceAuthenticated: true,
      governanceVerified: false,
      variables: [
        { key: "origin", semanticType: "origin", value: "Paris" },
        { key: "destination", semanticType: "destination", value: "Lyon" },
        { key: "country", semanticType: "country", value: "fr" },
        { key: "language", semanticType: "language", value: "fr-FR" },
        { key: "currency", semanticType: "currency", value: "eur" },
        { key: "unit_system", semanticType: "unit_system", value: "metric" },
        { key: "payment_style", semanticType: "payment_style", value: "bank_transfer" },
      ],
    },
  ],
});

if (
  result.normalizedContext.localization.countryCode !== "FR" ||
  result.normalizedContext.localization.languageCode !== "fr" ||
  result.normalizedContext.localization.currencyCode !== "EUR" ||
  result.normalizedContext.localization.unitSystem !== "metric"
) {
  throw new Error("Expected overridden localization values.");
}

if (result.normalizedContext.paymentStyle !== "bank_transfer") {
  throw new Error("Expected normalized payment style.");
}

console.log("SMOKE_INPUT_NORMALIZATION_OVERRIDE=PASS");