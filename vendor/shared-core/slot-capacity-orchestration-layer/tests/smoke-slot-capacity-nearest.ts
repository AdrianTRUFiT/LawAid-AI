import { runSlotCapacityOrchestration } from "../src/index.js";

const result = runSlotCapacityOrchestration({
  queryId: "slot_search_nearest_001",
  origin: "New York",
  destination: "Boston",
  objective: "balanced",
});

if (!result.rankedOptions.some((x) => x.nearestToDestination)) {
  throw new Error("Expected nearest-to-destination marking.");
}

console.log("SMOKE_SLOT_CAPACITY_NEAREST=PASS");