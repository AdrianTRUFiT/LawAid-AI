import { runQualityPreservationGate } from "../src/index.js";

const result = runQualityPreservationGate({
  subjectId: "qual_001",
  qualityScore: 0.9,
  providerReliabilityScore: 0.85,
  inquiryIntelligence: {
    inquiryIntelligenceId: "inq_qual_001",
    subjectId: "qual_001",
    problemClass: "coordination",
    governingDecision: "ADVANCE",
    whyScore: 0.8,
    movementScore: 0.7,
    poolingCandidate: true,
    reason: "Coordination inquiry.",
    createdAt: new Date().toISOString(),
  },
  poolingThreshold: {
    poolingThresholdId: "pool_qual_001",
    subjectId: "qual_001",
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

if (!result.ok || !result.artifact || result.artifact.qualityGateStatus !== "QUALITY_PASSED" || result.artifact.releaseSafe !== true) {
  throw new Error("Expected high-quality pass.");
}

console.log("SMOKE_QUALITY_HIGH_PASS=PASS");