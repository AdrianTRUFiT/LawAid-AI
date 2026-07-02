import { runAdaptiveGapAndEnablerClassifier } from "../src/index.js";

const result = runAdaptiveGapAndEnablerClassifier({
  subjectId: "gap_001",
  ecosystemReadiness: {
    ecosystemReadinessId: "eco_gap_001",
    subjectId: "gap_001",
    settlementType: "town",
    ecosystemReadinessStatus: "READINESS_TRANSITIONAL",
    readinessCompositeScore: 0.55,
    strongestLayer: "governance",
    weakestLayer: "energy",
    reason: "Readiness.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.ownershipLayer !== "sensor") {
  throw new Error("Expected sensor gap pass.");
}

console.log("SMOKE_ADAPTIVE_GAP_SENSOR=PASS");