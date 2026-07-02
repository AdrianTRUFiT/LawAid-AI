import { runAbsorbedRoleToEnablerDemandBridge } from "../src/index.js";

const result = runAbsorbedRoleToEnablerDemandBridge({
  subjectId: "ei89_002",
  cityLayerOpportunityMap: {
    cityLayerOpportunityMapId: "city_layer_opportunity_ei89_002",
    subjectId: "ei89_002",
    settlementType: "town",
    opportunitySurfaceClass: "automation_workflow_surface",
    primaryLayer: "mobility",
    recommendedOpportunityTypes: ["connectors"],
    reason: "Map.",
    createdAt: new Date().toISOString(),
  },
  absorbedRoleSignal: {
    absorbedRoleId: "absorbed_role_002",
    subjectId: "ei89_002",
    absorbedRoleClass: "logistics_coordination",
    reason: "Signal.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.demandClass !== "automation_and_connectors") {
  throw new Error("Expected logistics-role to automation demand pass.");
}

console.log("SMOKE_EI89_LOGISTICS_TO_AUTOMATION=PASS");