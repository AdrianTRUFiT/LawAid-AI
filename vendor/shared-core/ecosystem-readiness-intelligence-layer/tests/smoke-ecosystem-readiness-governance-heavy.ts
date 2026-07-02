import { runEcosystemReadinessIntelligence } from "../src/index.js";

const result = runEcosystemReadinessIntelligence({
  subjectId: "eco_004",
  settlementType: "city",
  energyScore: 0.62,
  waterWasteScore: 0.6,
  shelterScore: 0.59,
  productionScore: 0.58,
  mobilityScore: 0.61,
  foodScore: 0.56,
  healthSafetyScore: 0.6,
  governanceScore: 0.92,
});

if (!result.ok || !result.artifact || result.artifact.strongestLayer !== "governance") {
  throw new Error("Expected governance-heavy readiness pass.");
}

console.log("SMOKE_ECOSYSTEM_READINESS_GOVERNANCE_HEAVY=PASS");