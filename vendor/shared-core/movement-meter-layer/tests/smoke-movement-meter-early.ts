import { runMovementMeter } from "../src/index.js";

const result = runMovementMeter({
  subjectId: "asset_001",
  direction: "up",
  stateLabel: "early_ascent",
  magnitude: 1.5,
  ageBars: 2,
  p_nn: 0.6,
  anomalyScore: 0.1,
  timestamp: new Date().toISOString(),
});

if (!result.ok || !result.artifact || result.artifact.maturityClass !== "early") {
  throw new Error("Expected early movement classification.");
}

console.log("SMOKE_MOVEMENT_METER_EARLY=PASS");