import { runEcosystemReadinessIntelligence } from "../src/index.js";

const result = runEcosystemReadinessIntelligence({
  subjectId: "eco_002",
  settlementType: "town",
  energyScore: 0.58,
  waterWasteScore: 0.52,
  shelterScore: 0.49,
  productionScore: 0.41,
  mobilityScore: 0.47,
  foodScore: 0.61,
  healthSafetyScore: 0.55,
  governanceScore: 0.64,
});

if (!result.ok || !result.artifact || result.artifact.ecosystemReadinessStatus !== "READINESS_TRANSITIONAL") {
  throw new Error("Expected transitional town readiness pass.");
}

console.log("SMOKE_ECOSYSTEM_READINESS_TRANSITIONAL_TOWN=PASS");