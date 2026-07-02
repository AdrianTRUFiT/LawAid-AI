import { runAdaptiveConversionPlanBridge } from "../src/index.js";

const result = runAdaptiveConversionPlanBridge({
  subjectId: "plan_002",
  ecosystemReadiness: {
    ecosystemReadinessId: "eco_plan_002",
    subjectId: "plan_002",
    settlementType: "town",
    ecosystemReadinessStatus: "READINESS_TRANSITIONAL",
    readinessCompositeScore: 0.58,
    strongestLayer: "food",
    weakestLayer: "mobility",
    reason: "Readiness.",
    createdAt: new Date().toISOString(),
  },
  adaptiveGap: {
    adaptiveGapId: "gap_plan_002",
    subjectId: "plan_002",
    ownershipLayer: "machine",
    missingEnablerClass: "automation_workflow",
    weakestLayer: "mobility",
    conversionPriority: "medium",
    reason: "Gap.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.adaptiveConversionPlanStatus !== "CONVERSION_PLAN_MEDIUM_PRIORITY") {
  throw new Error("Expected medium-priority conversion plan.");
}

console.log("SMOKE_ADAPTIVE_PLAN_MEDIUM_PRIORITY=PASS");