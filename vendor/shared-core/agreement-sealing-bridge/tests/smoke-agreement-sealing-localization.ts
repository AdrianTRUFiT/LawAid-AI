import { runInputTrustNormalization } from "../../input-trust-normalization-layer/src/index.js";
import { runAgreementSealingBridge } from "../src/index.js";

const normalizationResult = runInputTrustNormalization({
  bundleId: "bundle_seal_004",
  scenarioId: "scenario_seal_004",
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
        { key: "unit_system", semanticType: "unit_system", value: "metric" }
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

if (!result.sealedArtifact || result.sealedArtifact.locale !== "fr-FR") {
  throw new Error("Expected localized sealed agreement artifact.");
}

console.log("SMOKE_AGREEMENT_SEALING_LOCALIZATION=PASS");