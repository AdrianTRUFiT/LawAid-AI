import { runLogisticsSearch } from "../../logistics-search-layer/src/index.js";
import type { SlotCapacitySearchResponse } from "../../slot-capacity-orchestration-layer/src/index.js";
import { runLogisticsBookingBridge } from "../src/index.js";

const searchResponse = runLogisticsSearch({
  queryId: "booking_auth_refusal_001",
  origin: "Miami",
  destination: "Chicago",
  objective: "fastest",
});

const slotResponse: SlotCapacitySearchResponse = {
  queryId: "booking_auth_refusal_001",
  origin: "Miami",
  destination: "Chicago",
  objective: "fastest",
  bestOption: {
    slotId: "slot_auth_required",
    nodeId: "node_auth_air",
    laneId: "lane_air_authorized",
    state: "authorization_required",
    nearestToDestination: true,
    authorizationRequired: true,
    usableNow: true,
    estimatedHoursToDestination: 3.2,
    distanceToDestinationKm: 30,
    costEstimate: 320,
    downstreamFrictionScore: 12,
    checkpointBurdenScore: 28,
    holdNodeBenefitScore: 10,
    resistanceScore: 42,
    totalScore: 91,
    why: ["requires authorization before movement may count"],
    who: ["originator requests movement"],
    what: ["slot state is authorization_required"],
    where: ["current node is node_auth_air"],
    when: ["estimated arrival window is 3.2 hours"],
    how: ["authorization gate must be satisfied"],
  },
  rankedOptions: [
    {
      slotId: "slot_auth_required",
      nodeId: "node_auth_air",
      laneId: "lane_air_authorized",
      state: "authorization_required",
      nearestToDestination: true,
      authorizationRequired: true,
      usableNow: true,
      estimatedHoursToDestination: 3.2,
      distanceToDestinationKm: 30,
      costEstimate: 320,
      downstreamFrictionScore: 12,
      checkpointBurdenScore: 28,
      holdNodeBenefitScore: 10,
      resistanceScore: 42,
      totalScore: 91,
      why: ["requires authorization before movement may count"],
      who: ["originator requests movement"],
      what: ["slot state is authorization_required"],
      where: ["current node is node_auth_air"],
      when: ["estimated arrival window is 3.2 hours"],
      how: ["authorization gate must be satisfied"],
    },
  ],
  summary: {
    totalSlotsSeen: 1,
    openCount: 0,
    occupiedCount: 0,
    reservedCount: 0,
    blockedCount: 0,
    authorizationRequiredCount: 1,
  },
  generatedAt: new Date().toISOString(),
};

const result = runLogisticsBookingBridge({
  searchResponse,
  slotResponse,
  authorizationGranted: false,
});

if (result.status !== "REFUSED" || result.refusal?.refusalCode !== "AUTHORIZATION_REQUIRED") {
  throw new Error("Expected authorization refusal.");
}

console.log("SMOKE_LOGISTICS_BOOKING_AUTHORIZATION_REFUSAL=PASS");