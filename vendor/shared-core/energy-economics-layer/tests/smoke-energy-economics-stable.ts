import { runEnergyEconomics } from "../src/index.js";

const result = runEnergyEconomics({
  subjectId: "energy_001",
  timeMinutes: 35,
  waitingMinutes: 5,
  handoffCount: 1,
  ambiguityScore: 0.1,
  reworkCount: 0,
  decisionCount: 2,
});

if (!result.ok || !result.artifact || result.artifact.stability.stabilityBalanceClass !== "stable") {
  throw new Error("Expected stable energy profile.");
}

console.log("SMOKE_ENERGY_ECONOMICS_STABLE=PASS");