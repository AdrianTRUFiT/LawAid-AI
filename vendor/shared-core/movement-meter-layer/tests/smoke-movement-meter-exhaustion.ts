import { runMovementMeter } from "../src/index.js";

const result = runMovementMeter({
  subjectId: "asset_003",
  direction: "down",
  stateLabel: "descent_exhaustion_risk",
  magnitude: 3.0,
  ageBars: 13,
  p_nn: 0.91,
  anomalyScore: 0.75,
  timestamp: new Date().toISOString(),
});

if (!result.ok || !result.artifact || result.artifact.maturityClass !== "exhaustion_risk" || result.artifact.transitionHazard.hazardClass !== "high") {
  throw new Error("Expected exhaustion-risk classification.");
}

console.log("SMOKE_MOVEMENT_METER_EXHAUSTION=PASS");