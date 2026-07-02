import type { LogisticsSearchResponse } from "../../logistics-search-layer/src/index.js";
import { runSlotCapacityOrchestration } from "../../slot-capacity-orchestration-layer/src/index.js";
import { runLogisticsBookingBridge } from "../src/index.js";

const searchResponse: LogisticsSearchResponse = {
  queryId: "booking_no_routes_001",
  objective: "balanced",
  fastestRoute: {
    routeId: "none",
    origin: "A",
    destination: "B",
    mode: "truck",
    estimatedHours: 0,
    estimatedCost: 0,
    delayRiskScore: 0,
    checkpointBurdenScore: 0,
    holdNodeBenefitScore: 0,
    protectionFitScore: 0,
    netValueScore: 0,
    rank: 0,
    totalScore: 0,
    tags: [],
    rankReason: "none",
  },
  cheapestRoute: {
    routeId: "none",
    origin: "A",
    destination: "B",
    mode: "truck",
    estimatedHours: 0,
    estimatedCost: 0,
    delayRiskScore: 0,
    checkpointBurdenScore: 0,
    holdNodeBenefitScore: 0,
    protectionFitScore: 0,
    netValueScore: 0,
    rank: 0,
    totalScore: 0,
    tags: [],
    rankReason: "none",
  },
  bestBalancedRoute: {
    routeId: "none",
    origin: "A",
    destination: "B",
    mode: "truck",
    estimatedHours: 0,
    estimatedCost: 0,
    delayRiskScore: 0,
    checkpointBurdenScore: 0,
    holdNodeBenefitScore: 0,
    protectionFitScore: 0,
    netValueScore: 0,
    rank: 0,
    totalScore: 0,
    tags: [],
    rankReason: "none",
  },
  rankedRoutes: [],
  generatedAt: new Date().toISOString(),
};

const slotResponse = runSlotCapacityOrchestration({
  queryId: "booking_no_routes_001",
  origin: "A",
  destination: "B",
  objective: "balanced",
});

const result = runLogisticsBookingBridge({
  searchResponse,
  slotResponse,
});

if (result.status !== "REFUSED" || result.refusal?.refusalCode !== "NO_ROUTE_OPTIONS") {
  throw new Error("Expected no-route refusal.");
}

console.log("SMOKE_LOGISTICS_BOOKING_NO_ROUTES=PASS");