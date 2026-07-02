import { runInputTrustNormalization } from "../../input-trust-normalization-layer/src/index.js";
import { runAgreementSealingBridge } from "../../agreement-sealing-bridge/src/index.js";
import { runLogisticsSearch } from "../../logistics-search-layer/src/index.js";
import { runSlotCapacityOrchestration } from "../../slot-capacity-orchestration-layer/src/index.js";
import { runLogisticsBookingBridge } from "../../logistics-booking-bridge/src/index.js";
import { runGovernedCommitmentBridge } from "../src/index.js";

const normalizationResult = runInputTrustNormalization({
  bundleId: "commitment_mismatch_bundle",
  scenarioId: "commitment_mismatch_scenario",
  contributions: [
    {
      sourceId: "src_route",
      sourceClass: "route_origin",
      sourceAuthenticated: true,
      governanceVerified: false,
      variables: [
        { key: "origin", semanticType: "origin", value: "Orlando" },
        { key: "destination", semanticType: "destination", value: "Miami" },
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

const searchResponse = runLogisticsSearch({
  queryId: "commitment_mismatch_query",
  origin: "Orlando",
  destination: "Atlanta",
  objective: "balanced",
});

const slotResponse = runSlotCapacityOrchestration({
  queryId: "commitment_mismatch_query",
  origin: "Orlando",
  destination: "Atlanta",
  objective: "balanced",
});

const bookingResult = runLogisticsBookingBridge({
  searchResponse,
  slotResponse,
});

const result = runGovernedCommitmentBridge({
  agreementResult,
  bookingResult,
});

if (result.status !== "REFUSED" || result.refusal?.refusalCode !== "ORIGIN_DESTINATION_MISMATCH") {
  throw new Error("Expected origin/destination mismatch refusal.");
}

console.log("SMOKE_GOVERNED_COMMITMENT_MISMATCH_REFUSAL=PASS");