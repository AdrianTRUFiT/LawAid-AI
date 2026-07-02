import { runEnergyEconomics } from "../src/index.js";

const result = runEnergyEconomics({
  subjectId: "energy_003",
  timeMinutes: 260,
  waitingMinutes: 95,
  handoffCount: 7,
  ambiguityScore: 0.9,
  reworkCount: 5,
  decisionCount: 11,
});

if (!result.ok || !result.artifact || result.artifact.stability.stabilityBalanceClass !== "depleted") {
  throw new Error("Expected depleted energy profile.");
}

console.log("SMOKE_ENERGY_ECONOMICS_DEPLETED=PASS");