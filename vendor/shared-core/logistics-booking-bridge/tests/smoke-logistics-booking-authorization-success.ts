import { runLogisticsSearch } from "../../logistics-search-layer/src/index.js";
import { runSlotCapacityOrchestration } from "../../slot-capacity-orchestration-layer/src/index.js";
import { runLogisticsBookingBridge } from "../src/index.js";

const searchResponse = runLogisticsSearch({
  queryId: "booking_auth_success_001",
  origin: "Miami",
  destination: "Chicago",
  objective: "fastest",
});

const slotResponse = runSlotCapacityOrchestration({
  queryId: "booking_auth_success_001",
  origin: "Miami",
  destination: "Chicago",
  objective: "fastest",
  urgencyScore: 95,
});

const result = runLogisticsBookingBridge({
  searchResponse,
  slotResponse,
  authorizationGranted: true,
});

if (result.status !== "BOOKING_READY" || !result.bookingArtifact) {
  throw new Error("Expected authorized booking-ready artifact.");
}

console.log("SMOKE_LOGISTICS_BOOKING_AUTHORIZATION_SUCCESS=PASS");