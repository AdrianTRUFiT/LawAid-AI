import { runSlotCapacityOrchestration } from "../src/index.js";

const result = runSlotCapacityOrchestration({
  queryId: "slot_search_open_001",
  origin: "Orlando",
  destination: "Atlanta",
  objective: "fastest",
});

if (!result.bestOption || !result.rankedOptions.some((x) => x.state === "open")) {
  throw new Error("Expected open slot candidate.");
}

console.log("SMOKE_SLOT_CAPACITY_OPEN=PASS");