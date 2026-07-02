import { runQualityPreservationGate } from "../src/index.js";

const result = runQualityPreservationGate({
  subjectId: "qual_002",
  qualityScore: 0.6,
  providerReliabilityScore: 0.55,
  inquiryIntelligence: {
    inquiryIntelligenceId: "inq_qual_002",
    subjectId: "qual_002",
    problemClass: "cost_control",
    governingDecision: "COMPARE",
    whyScore: 0.8,
    movementScore: 0.5,
    poolingCandidate: true,
    reason: "Budget inquiry.",
    createdAt: new Date().toISOString(),
  },
  poolingThreshold: {
    poolingThresholdId: "pool_qual_002",
    subjectId: "qual_002",
    poolingStatus: "POOLING_PENDING",
    currentDemandCount: 2,
    requiredThreshold: 4,
    thresholdGap: 2,
    releaseReady: false,
    poolingRecommended: true,
    reason: "Pooling pending.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.qualityGateStatus !== "QUALITY_HELD") {
  throw new Error("Expected quality hold.");
}

console.log("SMOKE_QUALITY_HOLD=PASS");