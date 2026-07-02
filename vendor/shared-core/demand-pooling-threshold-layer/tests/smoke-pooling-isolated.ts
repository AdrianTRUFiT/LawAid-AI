import { runDemandPoolingThreshold } from "../src/index.js";

const result = runDemandPoolingThreshold({
  subjectId: "pool_002",
  currentDemandCount: 1,
  requiredThreshold: 3,
  inquiryIntelligence: {
    inquiryIntelligenceId: "inq_intel_pool_002",
    subjectId: "pool_002",
    problemClass: "urgency",
    governingDecision: "ADVANCE",
    whyScore: 0.95,
    movementScore: 0.8,
    poolingCandidate: false,
    reason: "Urgency inquiry.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.poolingStatus !== "ISOLATED") {
  throw new Error("Expected isolated candidate.");
}

console.log("SMOKE_POOLING_ISOLATED=PASS");