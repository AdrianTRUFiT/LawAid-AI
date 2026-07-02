import { runCityLayerOpportunityMapper } from "../src/index.js";

const result = runCityLayerOpportunityMapper({
  subjectId: "ei88_001",
  adaptiveConversionPlan: {
    adaptiveConversionPlanId: "adaptive_conversion_plan_ei88_001",
    subjectId: "ei88_001",
    adaptiveConversionPlanStatus: "CONVERSION_PLAN_HIGH_PRIORITY",
    settlementType: "community",
    primaryConversionTrack: "sensor_instrumentation",
    firstMove: "Install instrumentation.",
    reason: "Plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.opportunitySurfaceClass !== "sensor_field_surface") {
  throw new Error("Expected sensor opportunity mapping pass.");
}

console.log("SMOKE_EI88_SENSOR_OPPORTUNITY=PASS");