import { runEcosystemReadinessIntelligence } from "../src/index.js";

const result = runEcosystemReadinessIntelligence({
  subjectId: "eco_005",
  settlementType: "town",
  energyScore: 1.4,
  waterWasteScore: 0.4,
  shelterScore: 0.4,
  productionScore: 0.4,
  mobilityScore: 0.4,
  foodScore: 0.4,
  healthSafetyScore: 0.4,
  governanceScore: 0.4,
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_SCORE") {
  throw new Error("Expected invalid score refusal.");
}

console.log("SMOKE_ECOSYSTEM_READINESS_INVALID_SCORE=PASS");