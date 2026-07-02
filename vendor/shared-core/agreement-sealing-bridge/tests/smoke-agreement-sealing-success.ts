import { runInputTrustNormalization } from "../../input-trust-normalization-layer/src/index.js";
import { runAgreementSealingBridge } from "../src/index.js";

const normalizationResult = runInputTrustNormalization({
  bundleId: "bundle_seal_001",
  scenarioId: "scenario_seal_001",
  contributions: [
    {
      sourceId: "src_route",
      sourceClass: "route_origin",
      sourceAuthenticated: true,
      governanceVerified: false,
      variables: [
        { key: "origin", semanticType: "origin", value: "New York" },
        { key: "destination", semanticType: "destination", value: "London" },
        { key: "language", semanticType: "language", value: "en" },
        { key: "currency", semanticType: "currency", value: "usd" },
        { key: "unit_system", semanticType: "unit_system", value: "imperial" }
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

const result = runAgreementSealingBridge({
  normalizationResult,
});

if (result.status !== "SEALED" || !result.sealedArtifact) {
  throw new Error("Expected sealed agreement artifact.");
}

console.log("SMOKE_AGREEMENT_SEALING_SUCCESS=PASS");