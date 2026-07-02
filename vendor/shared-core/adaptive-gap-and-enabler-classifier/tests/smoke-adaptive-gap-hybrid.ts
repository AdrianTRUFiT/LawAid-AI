import { runAdaptiveGapAndEnablerClassifier } from "../src/index.js";

const result = runAdaptiveGapAndEnablerClassifier({
  subjectId: "gap_003",
  ecosystemReadiness: {
    ecosystemReadinessId: "eco_gap_003",
    subjectId: "gap_003",
    settlementType: "community",
    ecosystemReadinessStatus: "READINESS_LOW",
    readinessCompositeScore: 0.33,
    strongestLayer: "governance",
    weakestLayer: "health_safety",
    reason: "Readiness.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.ownershipLayer !== "hybrid") {
  throw new Error("Expected hybrid gap pass.");
}

console.log("SMOKE_ADAPTIVE_GAP_HYBRID=PASS");