import { runEnergyEconomics } from "../src/index.js";

const result = runEnergyEconomics({
  subjectId: "energy_002",
  timeMinutes: 120,
  waitingMinutes: 25,
  handoffCount: 3,
  ambiguityScore: 0.4,
  reworkCount: 1,
  decisionCount: 6,
});

if (!result.ok || !result.artifact || result.artifact.stability.stabilityBalanceClass !== "imbalanced") {
  throw new Error("Expected imbalanced energy profile.");
}

console.log("SMOKE_ENERGY_ECONOMICS_STRAINED=PASS");