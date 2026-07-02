import { runInputTrustNormalization } from "../src/index.js";

const result = runInputTrustNormalization({
  bundleId: "bundle_conflict_001",
  scenarioId: "scenario_conflict_001",
  contributions: [
    {
      sourceId: "src_route_a",
      sourceClass: "route_origin",
      sourceAuthenticated: true,
      governanceVerified: false,
      variables: [
        { key: "origin", semanticType: "origin", value: "Madrid" },
        { key: "destination", semanticType: "destination", value: "Berlin" },
        { key: "language", semanticType: "language", value: "es" },
        { key: "currency", semanticType: "currency", value: "eur" },
        { key: "unit_system", semanticType: "unit_system", value: "metric" },
      ],
    },
    {
      sourceId: "src_route_b",
      sourceClass: "route_origin",
      sourceAuthenticated: true,
      governanceVerified: false,
      variables: [
        { key: "destination", semanticType: "destination", value: "Rome" },
      ],
    },
    {
      sourceId: "src_secure",
      sourceClass: "securing",
      sourceAuthenticated: true,
      governanceVerified: true,
      variables: [],
    },
  ],
});

if (result.agreementSealReadiness.sealReady) {
  throw new Error("Expected seal to be refused on conflict.");
}

if (result.agreementSealReadiness.conflictMessages.length === 0) {
  throw new Error("Expected conflict messages.");
}

console.log("SMOKE_INPUT_AGREEMENT_CONFLICT=PASS");