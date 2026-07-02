import { runLogisticalViabilityAndDownstreamConsequenceGuard } from "../src/index.js";

const result = runLogisticalViabilityAndDownstreamConsequenceGuard({
  subjectId: "ei90_005",
  enablerDemand: {
    enablerDemandId: "enabler_demand_005",
    subjectId: "wrong_ei90",
    absorbedRoleClass: "logistics_coordination",
    demandClass: "automation_and_connectors",
    recommendedDemandItems: ["connectors"],
    reason: "Demand.",
    createdAt: new Date().toISOString(),
  },
  upstreamDependencyScore: 0.7,
  economicViabilityScore: 0.7,
  downstreamConsequenceScore: 0.7,
  engagementDurabilityScore: 0.7,
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_EI90_SUBJECT_MISMATCH=PASS");