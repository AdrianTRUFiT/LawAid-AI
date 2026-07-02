import { runLogisticsSearch } from "../../logistics-search-layer/src/index.js";
import { runSlotCapacityOrchestration } from "../../slot-capacity-orchestration-layer/src/index.js";
import { runLogisticsBookingBridge } from "../src/index.js";

const searchResponse = runLogisticsSearch({
  queryId: "booking_success_001",
  origin: "Orlando",
  destination: "Atlanta",
  objective: "balanced",
});

const slotResponse = runSlotCapacityOrchestration({
  queryId: "booking_success_001",
  origin: "Orlando",
  destination: "Atlanta",
  objective: "balanced",
});

const result = runLogisticsBookingBridge({
  searchResponse,
  slotResponse,
});

if (result.status !== "BOOKING_READY" || !result.bookingArtifact) {
  throw new Error("Expected booking-ready artifact.");
}

console.log("SMOKE_LOGISTICS_BOOKING_SUCCESS=PASS");