import { runInputTrustNormalization } from "../../input-trust-normalization-layer/src/index.js";
import { runAgreementSealingBridge } from "../../agreement-sealing-bridge/src/index.js";
import { runGovernedCommitmentBridge } from "../src/index.js";

const normalizationResult = runInputTrustNormalization({
  bundleId: "commitment_booking_refusal_bundle",
  scenarioId: "commitment_booking_refusal_scenario",
  contributions: [
    {
      sourceId: "src_route",
      sourceClass: "route_origin",
      sourceAuthenticated: true,
      governanceVerified: false,
      variables: [
        { key: "origin", semanticType: "origin", value: "Orlando" },
        { key: "destination", semanticType: "destination", value: "Atlanta" },
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
      variables: [],
    },
  ],
});

const agreementResult = runAgreementSealingBridge({ normalizationResult });

const bookingResult = {
  status: "REFUSED",
  bookingArtifact: null,
  refusal: {
    refusalCode: "BLOCKED_SLOT",
    refusalReason: "blocked",
  },
  inputSummary: {
    queryId: "q",
    routeCount: 1,
    slotCount: 1,
    bestRouteId: "r",
    bestSlotId: "s",
  },
} as const;

const result = runGovernedCommitmentBridge({
  agreementResult,
  bookingResult,
});

if (result.status !== "REFUSED" || result.refusal?.refusalCode !== "BOOKING_NOT_READY") {
  throw new Error("Expected booking refusal.");
}

console.log("SMOKE_GOVERNED_COMMITMENT_BOOKING_REFUSAL=PASS");