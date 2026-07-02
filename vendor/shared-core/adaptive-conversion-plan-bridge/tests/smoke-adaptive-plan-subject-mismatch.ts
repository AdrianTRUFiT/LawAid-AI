import { runAdaptiveConversionPlanBridge } from "../src/index.js";

const result = runAdaptiveConversionPlanBridge({
  subjectId: "plan_005",
  ecosystemReadiness: {
    ecosystemReadinessId: "eco_plan_005",
    subjectId: "plan_005",
    settlementType: "town",
    ecosystemReadinessStatus: "READINESS_TRANSITIONAL",
    readinessCompositeScore: 0.51,
    strongestLayer: "governance",
    weakestLayer: "production",
    reason: "Readiness.",
    createdAt: new Date().toISOString(),
  },
  adaptiveGap: {
    adaptiveGapId: "gap_plan_005",
    subjectId: "wrong_plan",
    ownershipLayer: "machine",
    missingEnablerClass: "automation_workflow",
    weakestLayer: "production",
    conversionPriority: "medium",
    reason: "Gap.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_ADAPTIVE_PLAN_SUBJECT_MISMATCH=PASS");