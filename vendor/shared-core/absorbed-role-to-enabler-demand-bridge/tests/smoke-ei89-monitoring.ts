import { runAbsorbedRoleToEnablerDemandBridge } from "../src/index.js";

const result = runAbsorbedRoleToEnablerDemandBridge({
  subjectId: "ei89_003",
  cityLayerOpportunityMap: {
    cityLayerOpportunityMapId: "city_layer_opportunity_ei89_003",
    subjectId: "ei89_003",
    settlementType: "community",
    opportunitySurfaceClass: "hybrid_exception_surface",
    primaryLayer: "health_safety",
    recommendedOpportunityTypes: ["audit_tools"],
    reason: "Map.",
    createdAt: new Date().toISOString(),
  },
  absorbedRoleSignal: {
    absorbedRoleId: "absorbed_role_003",
    subjectId: "ei89_003",
    absorbedRoleClass: "routine_monitoring",
    reason: "Signal.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.demandClass !== "hybrid_audit_and_exception") {
  throw new Error("Expected monitoring-role to hybrid demand pass.");
}

console.log("SMOKE_EI89_MONITORING_TO_HYBRID=PASS");