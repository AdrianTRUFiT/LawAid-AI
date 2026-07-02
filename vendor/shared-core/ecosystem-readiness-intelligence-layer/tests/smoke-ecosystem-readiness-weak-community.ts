import { runEcosystemReadinessIntelligence } from "../src/index.js";

const result = runEcosystemReadinessIntelligence({
  subjectId: "eco_003",
  settlementType: "community",
  energyScore: 0.22,
  waterWasteScore: 0.3,
  shelterScore: 0.34,
  productionScore: 0.2,
  mobilityScore: 0.18,
  foodScore: 0.4,
  healthSafetyScore: 0.33,
  governanceScore: 0.37,
});

if (!result.ok || !result.artifact || result.artifact.ecosystemReadinessStatus !== "READINESS_LOW") {
  throw new Error("Expected weak community readiness hold.");
}

console.log("SMOKE_ECOSYSTEM_READINESS_WEAK_COMMUNITY=PASS");