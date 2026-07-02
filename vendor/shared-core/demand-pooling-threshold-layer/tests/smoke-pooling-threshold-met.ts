import { runDemandPoolingThreshold } from "../src/index.js";

const result = runDemandPoolingThreshold({
  subjectId: "pool_003",
  currentDemandCount: 5,
  requiredThreshold: 4,
  inquiryIntelligence: {
    inquiryIntelligenceId: "inq_intel_pool_003",
    subjectId: "pool_003",
    problemClass: "coordination",
    governingDecision: "ADVANCE",
    whyScore: 0.85,
    movementScore: 0.65,
    poolingCandidate: true,
    reason: "Coordination inquiry.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.poolingStatus !== "POOLING_READY" || result.artifact.releaseReady !== true) {
  throw new Error("Expected threshold met.");
}

console.log("SMOKE_POOLING_THRESHOLD_MET=PASS");