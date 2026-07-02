import { runAbsorbedRoleToEnablerDemandBridge } from "../src/index.js";

const result = runAbsorbedRoleToEnablerDemandBridge({
  subjectId: "ei89_005",
  cityLayerOpportunityMap: {
    cityLayerOpportunityMapId: "city_layer_opportunity_ei89_005",
    subjectId: "ei89_005",
    settlementType: "city",
    opportunitySurfaceClass: "sensor_field_surface",
    primaryLayer: "energy",
    recommendedOpportunityTypes: ["sensors"],
    reason: "Map.",
    createdAt: new Date().toISOString(),
  },
  absorbedRoleSignal: {
    absorbedRoleId: "absorbed_role_005",
    subjectId: "wrong_ei89",
    absorbedRoleClass: "generic_reporting",
    reason: "Signal.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_EI89_SUBJECT_MISMATCH=PASS");