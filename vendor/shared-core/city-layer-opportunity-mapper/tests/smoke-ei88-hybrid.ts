import { runCityLayerOpportunityMapper } from "../src/index.js";

const result = runCityLayerOpportunityMapper({
  subjectId: "ei88_003",
  adaptiveConversionPlan: {
    adaptiveConversionPlanId: "adaptive_conversion_plan_ei88_003",
    subjectId: "ei88_003",
    adaptiveConversionPlanStatus: "CONVERSION_PLAN_LOW_PRIORITY",
    settlementType: "city",
    primaryConversionTrack: "hybrid_exception_layer",
    firstMove: "Stand up anomaly interpretation.",
    reason: "Plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.opportunitySurfaceClass !== "hybrid_exception_surface") {
  throw new Error("Expected hybrid opportunity mapping pass.");
}

console.log("SMOKE_EI88_HYBRID_OPPORTUNITY=PASS");