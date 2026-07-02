import { runEcosystemReadinessIntelligence } from "../src/index.js";

const result = runEcosystemReadinessIntelligence({
  subjectId: "eco_001",
  settlementType: "city",
  energyScore: 0.88,
  waterWasteScore: 0.81,
  shelterScore: 0.79,
  productionScore: 0.84,
  mobilityScore: 0.82,
  foodScore: 0.76,
  healthSafetyScore: 0.85,
  governanceScore: 0.9,
});

if (!result.ok || !result.artifact || result.artifact.ecosystemReadinessStatus !== "READINESS_HIGH") {
  throw new Error("Expected strong city readiness pass.");
}

console.log("SMOKE_ECOSYSTEM_READINESS_STRONG_CITY=PASS");