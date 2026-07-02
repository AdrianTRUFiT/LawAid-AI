import { runMovementMeter } from "../src/index.js";

const result = runMovementMeter({
  subjectId: "asset_005",
  direction: "neutral",
  stateLabel: "mystery_state",
  magnitude: 0.1,
  ageBars: 2,
  timestamp: new Date().toISOString(),
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_STATE_LABEL") {
  throw new Error("Expected invalid-state refusal.");
}

console.log("SMOKE_MOVEMENT_METER_INVALID_STATE=PASS");