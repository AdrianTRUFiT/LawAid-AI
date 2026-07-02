import { runSlotCapacityOrchestration } from "../src/index.js";

const result = runSlotCapacityOrchestration({
  queryId: "slot_search_friction_001",
  origin: "Dallas",
  destination: "Houston",
  objective: "balanced",
});

const blocked = result.rankedOptions.find((x) => x.state === "blocked");

if (!blocked) {
  throw new Error("Expected blocked slot.");
}

if (!blocked.why.some((x) => x.includes("blocked slot"))) {
  throw new Error("Expected blocked friction explanation.");
}

console.log("SMOKE_SLOT_CAPACITY_FRICTION=PASS");