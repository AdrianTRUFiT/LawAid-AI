import { runEnergyEconomics } from "../src/index.js";

const result = runEnergyEconomics({
  subjectId: "energy_005",
  timeMinutes: 20,
  waitingMinutes: 3,
  handoffCount: 1,
  ambiguityScore: 1.4,
  reworkCount: 0,
  decisionCount: 1,
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_SCORE") {
  throw new Error("Expected invalid-score refusal.");
}

console.log("SMOKE_ENERGY_ECONOMICS_INVALID_SCORE=PASS");