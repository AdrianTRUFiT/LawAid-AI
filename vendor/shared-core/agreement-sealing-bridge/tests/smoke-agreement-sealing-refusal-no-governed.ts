import { runInputTrustNormalization } from "../../input-trust-normalization-layer/src/index.js";
import { runAgreementSealingBridge } from "../src/index.js";

const normalizationResult = runInputTrustNormalization({
  bundleId: "bundle_seal_003",
  scenarioId: "scenario_seal_003",
  contributions: [
    {
      sourceId: "src_route",
      sourceClass: "route_origin",
      sourceAuthenticated: true,
      governanceVerified: false,
      variables: [
        { key: "origin", semanticType: "origin", value: "Chicago" },
        { key: "destination", semanticType: "destination", value: "Toronto" },
        { key: "language", semanticType: "language", value: "en" },
        { key: "currency", semanticType: "currency", value: "usd" },
        { key: "unit_system", semanticType: "unit_system", value: "imperial" }
      ],
    },
  ],
});

const result = runAgreementSealingBridge({
  normalizationResult,
});

if (result.status !== "REFUSED" || !result.refusal || result.refusal.refusalCode !== "NO_GOVERNED_SECURING_SOURCE") {
  throw new Error("Expected refusal for missing governed securing source.");
}

console.log("SMOKE_AGREEMENT_SEALING_REFUSAL_NO_GOVERNED=PASS");