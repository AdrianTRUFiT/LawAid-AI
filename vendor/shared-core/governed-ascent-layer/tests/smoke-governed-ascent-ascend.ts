import { runGovernedAscent } from "../src/index.js";

const result = runGovernedAscent({
  subjectId: "path_001",
  currentStage: "GROUND_ZERO",
  targetStage: "LAYER_1",
  pressureProfile: {
    time: 0.3,
    money: 0.2,
    consumption: 0.2,
    logistics: 0.3,
    layers: 0.4,
  },
  movementMaturityClass: "early",
  hazardClass: "low",
  pressureClass: "guarded",
});

if (!result.ok || !result.artifact || result.artifact.decision !== "ASCEND") {
  throw new Error("Expected ascent approval.");
}

console.log("SMOKE_GOVERNED_ASCENT_ASCEND=PASS");