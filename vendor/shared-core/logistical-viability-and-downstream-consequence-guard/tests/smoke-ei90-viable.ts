import { runLogisticalViabilityAndDownstreamConsequenceGuard } from "../src/index.js";

const result = runLogisticalViabilityAndDownstreamConsequenceGuard({
  subjectId: "ei90_001",
  enablerDemand: {
    enablerDemandId: "enabler_demand_001",
    subjectId: "ei90_001",
    absorbedRoleClass: "logistics_coordination",
    demandClass: "automation_and_connectors",
    recommendedDemandItems: ["connectors"],
    reason: "Demand.",
    createdAt: new Date().toISOString(),
  },
  upstreamDependencyScore: 0.78,
  economicViabilityScore: 0.74,
  downstreamConsequenceScore: 0.72,
  engagementDurabilityScore: 0.77,
});

if (!result.ok || !result.artifact || result.artifact.logisticalViabilityStatus !== "CHAIN_SOUND_OPPORTUNITY") {
  throw new Error("Expected viable pass.");
}

console.log("SMOKE_EI90_VIABLE=PASS");