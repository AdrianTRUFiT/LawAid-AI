import { runGovernedAscent } from "../src/index.js";

const result = runGovernedAscent({
  subjectId: "path_003",
  currentStage: "GROUND_ZERO",
  targetStage: "LAYER_3",
  pressureProfile: {
    time: 0.2,
    money: 0.2,
    consumption: 0.2,
    logistics: 0.2,
    layers: 0.2,
  },
  movementMaturityClass: "early",
  hazardClass: "low",
  pressureClass: "low",
});

if (result.ok || result.refusal?.refusalCode !== "ILLEGAL_STAGE_JUMP") {
  throw new Error("Expected illegal stage jump refusal.");
}

console.log("SMOKE_GOVERNED_ASCENT_ILLEGAL_JUMP=PASS");