import { runAdaptiveGapAndEnablerClassifier } from "../src/index.js";

const result = runAdaptiveGapAndEnablerClassifier({
  subjectId: "gap_004",
  ecosystemReadiness: {
    ecosystemReadinessId: "eco_gap_004",
    subjectId: "gap_004",
    settlementType: "city",
    ecosystemReadinessStatus: "READINESS_HIGH",
    readinessCompositeScore: 0.81,
    strongestLayer: "energy",
    weakestLayer: "governance",
    reason: "Readiness.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.ownershipLayer !== "human") {
  throw new Error("Expected human governance gap pass.");
}

console.log("SMOKE_ADAPTIVE_GAP_HUMAN=PASS");