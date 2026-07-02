import { runGovernedAscent } from "../src/index.js";

const result = runGovernedAscent({
  subjectId: "path_002",
  currentStage: "LAYER_2",
  targetStage: "LAYER_3",
  pressureProfile: {
    time: 0.8,
    money: 0.7,
    consumption: 0.6,
    logistics: 0.8,
    layers: 0.7,
  },
  movementMaturityClass: "late",
  hazardClass: "elevated",
  pressureClass: "elevated",
});

if (!result.ok || !result.artifact || result.artifact.decision !== "HOLD") {
  throw new Error("Expected ascent hold.");
}

console.log("SMOKE_GOVERNED_ASCENT_HOLD=PASS");