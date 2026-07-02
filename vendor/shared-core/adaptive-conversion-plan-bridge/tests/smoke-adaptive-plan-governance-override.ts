import { runAdaptiveConversionPlanBridge } from "../src/index.js";

const result = runAdaptiveConversionPlanBridge({
  subjectId: "plan_004",
  ecosystemReadiness: {
    ecosystemReadinessId: "eco_plan_004",
    subjectId: "plan_004",
    settlementType: "city",
    ecosystemReadinessStatus: "READINESS_TRANSITIONAL",
    readinessCompositeScore: 0.62,
    strongestLayer: "energy",
    weakestLayer: "governance",
    reason: "Readiness.",
    createdAt: new Date().toISOString(),
  },
  adaptiveGap: {
    adaptiveGapId: "gap_plan_004",
    subjectId: "plan_004",
    ownershipLayer: "human",
    missingEnablerClass: "governance_override",
    weakestLayer: "governance",
    conversionPriority: "medium",
    reason: "Gap.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.primaryConversionTrack !== "human_governance_layer") {
  throw new Error("Expected governance-override plan.");
}

console.log("SMOKE_ADAPTIVE_PLAN_GOVERNANCE_OVERRIDE=PASS");