import { runInputTrustNormalization } from "../src/index.js";

const result = runInputTrustNormalization({
  bundleId: "bundle_primary_001",
  scenarioId: "scenario_primary_001",
  contributions: [
    {
      sourceId: "src_route",
      sourceClass: "route_origin",
      sourceAuthenticated: true,
      governanceVerified: false,
      variables: [
        { key: "origin", semanticType: "origin", value: "Orlando" },
        { key: "destination", semanticType: "destination", value: "Miami" },
      ],
    },
  ],
});

const routeSource = result.trustClassifications.find((x) => x.sourceId === "src_route");

if (!routeSource || !routeSource.primaryRouteAuthority) {
  throw new Error("Expected primary route authority.");
}

if (result.normalizedContext.origin !== "Orlando" || result.normalizedContext.destination !== "Miami") {
  throw new Error("Expected normalized origin and destination.");
}

console.log("SMOKE_INPUT_TRUST_PRIMARY=PASS");