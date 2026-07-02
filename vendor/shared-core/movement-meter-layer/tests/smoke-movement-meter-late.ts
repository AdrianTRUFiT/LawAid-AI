import { runMovementMeter } from "../src/index.js";

const result = runMovementMeter({
  subjectId: "asset_002",
  direction: "up",
  stateLabel: "late_ascent",
  magnitude: 2.4,
  ageBars: 11,
  p_nn: 0.82,
  anomalyScore: 0.35,
  timestamp: new Date().toISOString(),
});

if (!result.ok || !result.artifact || result.artifact.maturityClass !== "late") {
  throw new Error("Expected late movement classification.");
}

console.log("SMOKE_MOVEMENT_METER_LATE=PASS");