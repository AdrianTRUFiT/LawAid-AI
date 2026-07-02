import { runGovernedAscent } from "../src/index.js";

const result = runGovernedAscent({
  subjectId: "path_004",
  currentStage: "LAYER_4",
  targetStage: "LAYER_5",
  pressureProfile: {
    time: 0.95,
    money: 0.92,
    consumption: 0.93,
    logistics: 0.91,
    layers: 0.94,
  },
  movementMaturityClass: "late",
  hazardClass: "guarded",
  pressureClass: "high",
});

if (result.ok || result.refusal?.refusalCode !== "PRESSURE_OVERLOAD") {
  throw new Error("Expected pressure overload refusal.");
}

console.log("SMOKE_GOVERNED_ASCENT_PRESSURE_OVERLOAD=PASS");