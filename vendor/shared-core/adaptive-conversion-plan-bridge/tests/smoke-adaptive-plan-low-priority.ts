import { runAdaptiveConversionPlanBridge } from "../src/index.js";

const result = runAdaptiveConversionPlanBridge({
  subjectId: "plan_003",
  ecosystemReadiness: {
    ecosystemReadinessId: "eco_plan_003",
    subjectId: "plan_003",
    settlementType: "city",
    ecosystemReadinessStatus: "READINESS_HIGH",
    readinessCompositeScore: 0.84,
    strongestLayer: "governance",
    weakestLayer: "food",
    reason: "Readiness.",
    createdAt: new Date().toISOString(),
  },
  adaptiveGap: {
    adaptiveGapId: "gap_plan_003",
    subjectId: "plan_003",
    ownershipLayer: "hybrid",
    missingEnablerClass: "anomaly_resolution",
    weakestLayer: "food",
    conversionPriority: "low",
    reason: "Gap.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.adaptiveConversionPlanStatus !== "CONVERSION_PLAN_LOW_PRIORITY") {
  throw new Error("Expected low-priority conversion plan.");
}

console.log("SMOKE_ADAPTIVE_PLAN_LOW_PRIORITY=PASS");