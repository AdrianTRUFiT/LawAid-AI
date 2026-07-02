import { runCityLayerOpportunityMapper } from "../src/index.js";

const result = runCityLayerOpportunityMapper({
  subjectId: "ei88_005",
  adaptiveConversionPlan: {
    adaptiveConversionPlanId: "adaptive_conversion_plan_ei88_005",
    subjectId: "wrong_ei88",
    adaptiveConversionPlanStatus: "CONVERSION_PLAN_HIGH_PRIORITY",
    settlementType: "community",
    primaryConversionTrack: "sensor_instrumentation",
    firstMove: "Install instrumentation.",
    reason: "Plan.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_EI88_SUBJECT_MISMATCH=PASS");