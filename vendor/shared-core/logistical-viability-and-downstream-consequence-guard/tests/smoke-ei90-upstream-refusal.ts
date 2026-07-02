import { runLogisticalViabilityAndDownstreamConsequenceGuard } from "../src/index.js";

const result = runLogisticalViabilityAndDownstreamConsequenceGuard({
  subjectId: "ei90_004",
  enablerDemand: {
    enablerDemandId: "enabler_demand_004",
    subjectId: "ei90_004",
    absorbedRoleClass: "basic_permit_processing",
    demandClass: "governance_and_override_tools",
    recommendedDemandItems: ["approval_interfaces"],
    reason: "Demand.",
    createdAt: new Date().toISOString(),
  },
  upstreamDependencyScore: 0.21,
  economicViabilityScore: 0.7,
  downstreamConsequenceScore: 0.7,
  engagementDurabilityScore: 0.7,
});

if (!result.ok || !result.artifact || result.artifact.logisticalViabilityStatus !== "REFUSED_UPSTREAM") {
  throw new Error("Expected upstream fragility refusal.");
}

console.log("SMOKE_EI90_UPSTREAM_REFUSAL=PASS");