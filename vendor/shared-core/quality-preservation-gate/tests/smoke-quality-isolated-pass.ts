import { runQualityPreservationGate } from "../src/index.js";

const result = runQualityPreservationGate({
  subjectId: "qual_004",
  qualityScore: 0.82,
  providerReliabilityScore: 0.8,
  inquiryIntelligence: {
    inquiryIntelligenceId: "inq_qual_004",
    subjectId: "qual_004",
    problemClass: "urgency",
    governingDecision: "ADVANCE",
    whyScore: 0.95,
    movementScore: 0.85,
    poolingCandidate: false,
    reason: "Urgency inquiry.",
    createdAt: new Date().toISOString(),
  },
  poolingThreshold: {
    poolingThresholdId: "pool_qual_004",
    subjectId: "qual_004",
    poolingStatus: "ISOLATED",
    currentDemandCount: 1,
    requiredThreshold: 1,
    thresholdGap: 0,
    releaseReady: false,
    poolingRecommended: false,
    reason: "Isolated movement.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.releaseSafe !== true) {
  throw new Error("Expected isolated quality pass.");
}

console.log("SMOKE_QUALITY_ISOLATED_PASS=PASS");