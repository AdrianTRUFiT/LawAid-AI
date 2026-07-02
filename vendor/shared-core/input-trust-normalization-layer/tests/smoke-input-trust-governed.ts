import { runInputTrustNormalization } from "../src/index.js";

const result = runInputTrustNormalization({
  bundleId: "bundle_governed_001",
  scenarioId: "scenario_governed_001",
  contributions: [
    {
      sourceId: "src_route",
      sourceClass: "route_origin",
      sourceAuthenticated: true,
      governanceVerified: false,
      variables: [
        { key: "origin", semanticType: "origin", value: "Boston" },
        { key: "destination", semanticType: "destination", value: "Paris" },
        { key: "language", semanticType: "language", value: "en" },
        { key: "currency", semanticType: "currency", value: "usd" },
        { key: "unit_system", semanticType: "unit_system", value: "imperial" },
      ],
    },
    {
      sourceId: "src_secure",
      sourceClass: "securing",
      sourceAuthenticated: true,
      governanceVerified: true,
      variables: [
        { key: "payment_style", semanticType: "payment_style", value: "wallet" },
      ],
    },
  ],
});

if (!result.agreementSealReadiness.sealReady) {
  throw new Error("Expected agreement seal readiness.");
}

if (!result.agreementSealReadiness.sealHash) {
  throw new Error("Expected seal hash.");
}

console.log("SMOKE_INPUT_TRUST_GOVERNED=PASS");