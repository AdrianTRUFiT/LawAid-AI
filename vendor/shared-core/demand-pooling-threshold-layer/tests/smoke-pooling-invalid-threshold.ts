import { runDemandPoolingThreshold } from "../src/index.js";

const result = runDemandPoolingThreshold({
  subjectId: "pool_005",
  currentDemandCount: 2,
  requiredThreshold: 0,
  inquiryIntelligence: {
    inquiryIntelligenceId: "inq_intel_pool_005",
    subjectId: "pool_005",
    problemClass: "coordination",
    governingDecision: "ADVANCE",
    whyScore: 0.8,
    movementScore: 0.6,
    poolingCandidate: true,
    reason: "Coordination inquiry.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_THRESHOLD") {
  throw new Error("Expected invalid-threshold refusal.");
}

console.log("SMOKE_POOLING_INVALID_THRESHOLD=PASS");