import { runSlotCapacityOrchestration } from "../src/index.js";

const result = runSlotCapacityOrchestration({
  queryId: "slot_search_auth_001",
  origin: "Miami",
  destination: "Chicago",
  objective: "fastest",
  urgencyScore: 90,
});

const authSlot = result.rankedOptions.find((x) => x.authorizationRequired);

if (!authSlot) {
  throw new Error("Expected authorization-required slot.");
}

if (!authSlot.why.some((x) => x.includes("requires authorization"))) {
  throw new Error("Expected authorization explanation.");
}

console.log("SMOKE_SLOT_CAPACITY_AUTHORIZATION=PASS");