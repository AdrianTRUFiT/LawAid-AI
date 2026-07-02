import { runEnergyEconomics } from "../src/index.js";

const result = runEnergyEconomics({
  subjectId: "energy_004",
  timeMinutes: -1,
  waitingMinutes: 5,
  handoffCount: 1,
  ambiguityScore: 0.2,
  reworkCount: 0,
  decisionCount: 1,
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_TIME") {
  throw new Error("Expected invalid-time refusal.");
}

console.log("SMOKE_ENERGY_ECONOMICS_INVALID_TIME=PASS");