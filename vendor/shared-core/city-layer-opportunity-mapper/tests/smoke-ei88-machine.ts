import { runCityLayerOpportunityMapper } from "../src/index.js";

const result = runCityLayerOpportunityMapper({
  subjectId: "ei88_002",
  adaptiveConversionPlan: {
    adaptiveConversionPlanId: "adaptive_conversion_plan_ei88_002",
    subjectId: "ei88_002",
    adaptiveConversionPlanStatus: "CONVERSION_PLAN_MEDIUM_PRIORITY",
    settlementType: "town",
    primaryConversionTrack: "machine_automation",
    firstMove: "Build automation.",
    reason: "Plan.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.opportunitySurfaceClass !== "automation_workflow_surface") {
  throw new Error("Expected machine opportunity mapping pass.");
}

console.log("SMOKE_EI88_MACHINE_OPPORTUNITY=PASS");