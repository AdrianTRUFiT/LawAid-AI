import { runCityLayerOpportunityMapper } from "../src/index.js";

const result = runCityLayerOpportunityMapper({
  subjectId: "ei88_004",
  adaptiveConversionPlan: {
    adaptiveConversionPlanId: "adaptive_conversion_plan_ei88_004",
    subjectId: "ei88_004",
    adaptiveConversionPlanStatus: "CONVERSION_PLAN_MEDIUM_PRIORITY",
    settlementType: "city",
    primaryConversionTrack: "human_governance_layer",
    firstMove: "Establish governance.",
    reason: "Plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.opportunitySurfaceClass !== "human_governance_surface") {
  throw new Error("Expected human governance mapping pass.");
}

console.log("SMOKE_EI88_HUMAN_OPPORTUNITY=PASS");