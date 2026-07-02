import { runInputTrustNormalization } from "../../input-trust-normalization-layer/src/index.js";
import { runAgreementSealingBridge } from "../src/index.js";

const normalizationResult = runInputTrustNormalization({
  bundleId: "bundle_seal_002",
  scenarioId: "scenario_seal_002",
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
        { key: "unit_system", semanticType: "unit_system", value: "metric" }
      ],
    },
    {
      sourceId: "src_route_b",
      sourceClass: "route_origin",
      sourceAuthenticated: true,
      governanceVerified: false,
      variables: [
        { key: "destination", semanticType: "destination", value: "Rome" }
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

const result = runAgreementSealingBridge({
  normalizationResult,
});

if (result.status !== "REFUSED" || !result.refusal || result.refusal.refusalCode !== "CONFLICT_PRESENT") {
  throw new Error("Expected conflict refusal.");
}

console.log("SMOKE_AGREEMENT_SEALING_REFUSAL_CONFLICT=PASS");