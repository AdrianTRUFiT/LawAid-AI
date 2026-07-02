import { runAbsorbedRoleToEnablerDemandBridge } from "../src/index.js";

const result = runAbsorbedRoleToEnablerDemandBridge({
  subjectId: "ei89_001",
  cityLayerOpportunityMap: {
    cityLayerOpportunityMapId: "city_layer_opportunity_ei89_001",
    subjectId: "ei89_001",
    settlementType: "city",
    opportunitySurfaceClass: "sensor_field_surface",
    primaryLayer: "energy",
    recommendedOpportunityTypes: ["sensors"],
    reason: "Map.",
    createdAt: new Date().toISOString(),
  },
  absorbedRoleSignal: {
    absorbedRoleId: "absorbed_role_001",
    subjectId: "ei89_001",
    absorbedRoleClass: "generic_reporting",
    reason: "Signal.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.demandClass !== "sensor_and_field_devices") {
  throw new Error("Expected reporting-role to sensor demand pass.");
}

console.log("SMOKE_EI89_REPORTING_TO_SENSOR=PASS");