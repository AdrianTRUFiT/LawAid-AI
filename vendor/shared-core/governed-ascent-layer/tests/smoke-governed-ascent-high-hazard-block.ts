import { runGovernedAscent } from "../src/index.js";

const result = runGovernedAscent({
  subjectId: "path_005",
  currentStage: "LAYER_5",
  targetStage: "LAYER_6",
  pressureProfile: {
    time: 0.4,
    money: 0.4,
    consumption: 0.4,
    logistics: 0.4,
    layers: 0.4,
  },
  movementMaturityClass: "exhaustion_risk",
  hazardClass: "high",
  pressureClass: "guarded",
});

if (result.ok || result.refusal?.refusalCode !== "HIGH_HAZARD_BLOCK") {
  throw new Error("Expected high hazard block refusal.");
}

console.log("SMOKE_GOVERNED_ASCENT_HIGH_HAZARD_BLOCK=PASS");