import { runDemandPoolingThreshold } from "../src/index.js";

const result = runDemandPoolingThreshold({
  subjectId: "pool_001",
  currentDemandCount: 2,
  requiredThreshold: 4,
  inquiryIntelligence: {
    inquiryIntelligenceId: "inq_intel_pool_001",
    subjectId: "pool_001",
    problemClass: "coordination",
    governingDecision: "ADVANCE",
    whyScore: 0.8,
    movementScore: 0.6,
    poolingCandidate: true,
    reason: "Coordination inquiry.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.poolingRecommended !== true) {
  throw new Error("Expected pooling candidate.");
}

console.log("SMOKE_POOLING_CANDIDATE=PASS");