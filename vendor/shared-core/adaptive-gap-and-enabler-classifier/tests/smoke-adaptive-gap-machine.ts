import { runAdaptiveGapAndEnablerClassifier } from "../src/index.js";

const result = runAdaptiveGapAndEnablerClassifier({
  subjectId: "gap_002",
  ecosystemReadiness: {
    ecosystemReadinessId: "eco_gap_002",
    subjectId: "gap_002",
    settlementType: "city",
    ecosystemReadinessStatus: "READINESS_TRANSITIONAL",
    readinessCompositeScore: 0.63,
    strongestLayer: "energy",
    weakestLayer: "mobility",
    reason: "Readiness.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.ownershipLayer !== "machine") {
  throw new Error("Expected machine gap pass.");
}

console.log("SMOKE_ADAPTIVE_GAP_MACHINE=PASS");