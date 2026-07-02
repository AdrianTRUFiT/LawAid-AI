import type { AgreementSealingBridgeResult } from "../../agreement-sealing-bridge/src/index.js";
import { runLogisticsSearch } from "../../logistics-search-layer/src/index.js";
import { runSlotCapacityOrchestration } from "../../slot-capacity-orchestration-layer/src/index.js";
import { runLogisticsBookingBridge } from "../../logistics-booking-bridge/src/index.js";
import { runGovernedCommitmentBridge } from "../src/index.js";

const agreementResult: AgreementSealingBridgeResult = {
  status: "REFUSED",
  sealedArtifact: null,
  refusal: {
    refusalCode: "SEAL_NOT_READY",
    refusalReason: "not ready",
    missingRequiredKeys: ["origin"],
    conflictMessages: [],
  },
  inputSummary: {
    scenarioId: "x",
    bundleId: "y",
    sealReady: false,
    conflictCount: 0,
    normalizedFieldCount: 0,
  },
};

const searchResponse = runLogisticsSearch({
  queryId: "commitment_agreement_refusal_query",
  origin: "Orlando",
  destination: "Atlanta",
  objective: "balanced",
});

const slotResponse = runSlotCapacityOrchestration({
  queryId: "commitment_agreement_refusal_query",
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

if (result.status !== "REFUSED" || result.refusal?.refusalCode !== "AGREEMENT_NOT_SEALED") {
  throw new Error("Expected agreement refusal.");
}

console.log("SMOKE_GOVERNED_COMMITMENT_AGREEMENT_REFUSAL=PASS");