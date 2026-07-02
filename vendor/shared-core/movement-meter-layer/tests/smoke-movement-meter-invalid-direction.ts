import { runMovementMeter } from "../src/index.js";

const result = runMovementMeter({
  subjectId: "asset_004",
  direction: "sideways",
  stateLabel: "neutral_compression",
  magnitude: 0.5,
  ageBars: 5,
  timestamp: new Date().toISOString(),
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_DIRECTION") {
  throw new Error("Expected invalid-direction refusal.");
}

console.log("SMOKE_MOVEMENT_METER_INVALID_DIRECTION=PASS");