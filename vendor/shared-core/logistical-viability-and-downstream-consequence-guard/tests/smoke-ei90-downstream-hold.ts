import { runLogisticalViabilityAndDownstreamConsequenceGuard } from "../src/index.js";

const result = runLogisticalViabilityAndDownstreamConsequenceGuard({
  subjectId: "ei90_003",
  enablerDemand: {
    enablerDemandId: "enabler_demand_003",
    subjectId: "ei90_003",
    absorbedRoleClass: "routine_monitoring",
    demandClass: "hybrid_audit_and_exception",
    recommendedDemandItems: ["audit_tools"],
    reason: "Demand.",
    createdAt: new Date().toISOString(),
  },
  upstreamDependencyScore: 0.69,
  economicViabilityScore: 0.68,
  downstreamConsequenceScore: 0.42,
  engagementDurabilityScore: 0.63,
});

if (!result.ok || !result.artifact || result.artifact.logisticalViabilityStatus !== "HELD_DOWNSTREAM") {
  throw new Error("Expected downstream consequence hold.");
}

console.log("SMOKE_EI90_DOWNSTREAM_HOLD=PASS");