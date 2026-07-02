import { runAbsorbedRoleToEnablerDemandBridge } from "../src/index.js";

const result = runAbsorbedRoleToEnablerDemandBridge({
  subjectId: "ei89_004",
  cityLayerOpportunityMap: {
    cityLayerOpportunityMapId: "city_layer_opportunity_ei89_004",
    subjectId: "ei89_004",
    settlementType: "city",
    opportunitySurfaceClass: "human_governance_surface",
    primaryLayer: "governance",
    recommendedOpportunityTypes: ["approval_interfaces"],
    reason: "Map.",
    createdAt: new Date().toISOString(),
  },
  absorbedRoleSignal: {
    absorbedRoleId: "absorbed_role_004",
    subjectId: "ei89_004",
    absorbedRoleClass: "basic_permit_processing",
    reason: "Signal.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.demandClass !== "governance_and_override_tools") {
  throw new Error("Expected permit-role to governance demand pass.");
}

console.log("SMOKE_EI89_PERMIT_TO_GOVERNANCE=PASS");