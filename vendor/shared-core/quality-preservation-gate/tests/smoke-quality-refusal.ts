import { runQualityPreservationGate } from "../src/index.js";

const result = runQualityPreservationGate({
  subjectId: "qual_003",
  qualityScore: 0.2,
  providerReliabilityScore: 0.25,
  inquiryIntelligence: {
    inquiryIntelligenceId: "inq_qual_003",
    subjectId: "qual_003",
    problemClass: "quality",
    governingDecision: "COMPARE",
    whyScore: 0.9,
    movementScore: 0.4,
    poolingCandidate: false,
    reason: "Quality inquiry.",
    createdAt: new Date().toISOString(),
  },
  poolingThreshold: {
    poolingThresholdId: "pool_qual_003",
    subjectId: "qual_003",
    poolingStatus: "ISOLATED",
    currentDemandCount: 1,
    requiredThreshold: 1,
    thresholdGap: 0,
    releaseReady: false,
    poolingRecommended: false,
    reason: "Isolated.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.qualityGateStatus !== "QUALITY_REFUSED") {
  throw new Error("Expected quality refusal.");
}

console.log("SMOKE_QUALITY_REFUSAL=PASS");