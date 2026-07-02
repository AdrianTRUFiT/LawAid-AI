import { runSlotCapacityOrchestration } from "../src/index.js";

const result = runSlotCapacityOrchestration({
  queryId: "slot_search_summary_001",
  origin: "Paris",
  destination: "Lyon",
  objective: "cheapest",
});

if (result.summary.totalSlotsSeen < 5) {
  throw new Error("Expected full slot summary.");
}

if (
  result.summary.openCount === 0 ||
  result.summary.occupiedCount === 0 ||
  result.summary.reservedCount === 0 ||
  result.summary.blockedCount === 0 ||
  result.summary.authorizationRequiredCount === 0
) {
  throw new Error("Expected mixed slot-state summary.");
}

console.log("SMOKE_SLOT_CAPACITY_SUMMARY=PASS");