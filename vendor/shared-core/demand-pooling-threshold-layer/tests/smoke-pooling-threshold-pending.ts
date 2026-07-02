import { runDemandPoolingThreshold } from "../src/index.js";

const result = runDemandPoolingThreshold({
  subjectId: "pool_004",
  currentDemandCount: 2,
  requiredThreshold: 5,
  inquiryIntelligence: {
    inquiryIntelligenceId: "inq_intel_pool_004",
    subjectId: "pool_004",
    problemClass: "cost_control",
    governingDecision: "COMPARE",
    whyScore: 0.9,
    movementScore: 0.55,
    poolingCandidate: true,
    reason: "Pooling-capable budget inquiry.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.poolingStatus !== "POOLING_PENDING" || result.artifact.thresholdGap !== 3) {
  throw new Error("Expected threshold pending.");
}

console.log("SMOKE_POOLING_THRESHOLD_PENDING=PASS");