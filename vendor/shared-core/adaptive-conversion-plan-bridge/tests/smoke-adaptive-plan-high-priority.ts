import { runAdaptiveConversionPlanBridge } from "../src/index.js";

const result = runAdaptiveConversionPlanBridge({
  subjectId: "plan_001",
  ecosystemReadiness: {
    ecosystemReadinessId: "eco_plan_001",
    subjectId: "plan_001",
    settlementType: "community",
    ecosystemReadinessStatus: "READINESS_LOW",
    readinessCompositeScore: 0.31,
    strongestLayer: "governance",
    weakestLayer: "energy",
    reason: "Readiness.",
    createdAt: new Date().toISOString(),
  },
  adaptiveGap: {
    adaptiveGapId: "gap_plan_001",
    subjectId: "plan_001",
    ownershipLayer: "sensor",
    missingEnablerClass: "sensor_package",
    weakestLayer: "energy",
    conversionPriority: "high",
    reason: "Gap.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.adaptiveConversionPlanStatus !== "CONVERSION_PLAN_HIGH_PRIORITY") {
  throw new Error("Expected high-priority conversion plan.");
}

console.log("SMOKE_ADAPTIVE_PLAN_HIGH_PRIORITY=PASS");