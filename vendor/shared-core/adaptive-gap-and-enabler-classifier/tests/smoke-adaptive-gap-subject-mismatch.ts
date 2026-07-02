import { runAdaptiveGapAndEnablerClassifier } from "../src/index.js";

const result = runAdaptiveGapAndEnablerClassifier({
  subjectId: "gap_005",
  ecosystemReadiness: {
    ecosystemReadinessId: "eco_gap_005",
    subjectId: "wrong_gap",
    settlementType: "town",
    ecosystemReadinessStatus: "READINESS_LOW",
    readinessCompositeScore: 0.3,
    strongestLayer: "food",
    weakestLayer: "production",
    reason: "Readiness.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_ADAPTIVE_GAP_SUBJECT_MISMATCH=PASS");