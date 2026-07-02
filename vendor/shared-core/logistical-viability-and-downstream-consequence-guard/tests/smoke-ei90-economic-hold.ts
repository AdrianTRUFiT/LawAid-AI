import { runLogisticalViabilityAndDownstreamConsequenceGuard } from "../src/index.js";

const result = runLogisticalViabilityAndDownstreamConsequenceGuard({
  subjectId: "ei90_002",
  enablerDemand: {
    enablerDemandId: "enabler_demand_002",
    subjectId: "ei90_002",
    absorbedRoleClass: "generic_reporting",
    demandClass: "sensor_and_field_devices",
    recommendedDemandItems: ["sensors"],
    reason: "Demand.",
    createdAt: new Date().toISOString(),
  },
  upstreamDependencyScore: 0.7,
  economicViabilityScore: 0.41,
  downstreamConsequenceScore: 0.75,
  engagementDurabilityScore: 0.71,
});

if (!result.ok || !result.artifact || result.artifact.logisticalViabilityStatus !== "HELD_ECONOMICALLY") {
  throw new Error("Expected economic hold.");
}

console.log("SMOKE_EI90_ECONOMIC_HOLD=PASS");