import { runQualityPreservationGate } from "../src/index.js";

const result = runQualityPreservationGate({
  subjectId: "qual_005",
  qualityScore: 1.4,
  providerReliabilityScore: 0.7,
  inquiryIntelligence: {
    inquiryIntelligenceId: "inq_qual_005",
    subjectId: "qual_005",
    problemClass: "coordination",
    governingDecision: "ADVANCE",
    whyScore: 0.8,
    movementScore: 0.7,
    poolingCandidate: true,
    reason: "Coordination inquiry.",
    createdAt: new Date().toISOString(),
  },
  poolingThreshold: {
    poolingThresholdId: "pool_qual_005",
    subjectId: "qual_005",
    poolingStatus: "POOLING_READY",
    currentDemandCount: 5,
    requiredThreshold: 4,
    thresholdGap: 0,
    releaseReady: true,
    poolingRecommended: true,
    reason: "Pooling ready.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_SCORE") {
  throw new Error("Expected invalid-score refusal.");
}

console.log("SMOKE_QUALITY_INVALID_SCORE=PASS");