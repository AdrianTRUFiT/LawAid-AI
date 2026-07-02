import { runPnlIntelligenceGuard } from "../src/index.js";

const result = runPnlIntelligenceGuard({
  subjectId: "pnl_005",
  expectedRevenueMinor: 0,
  expectedCostMinor: 5000,
  poolingThreshold: {
    poolingThresholdId: "pool_pnl_005",
    subjectId: "pnl_005",
    poolingStatus: "POOLING_READY",
    currentDemandCount: 5,
    requiredThreshold: 4,
    thresholdGap: 0,
    releaseReady: true,
    poolingRecommended: true,
    reason: "Pooling ready.",
    createdAt: new Date().toISOString(),
  },
  qualityGate: {
    qualityGateId: "qual_pnl_005",
    subjectId: "pnl_005",
    qualityGateStatus: "QUALITY_PASSED",
    qualityScore: 0.9,
    providerReliabilityScore: 0.9,
    qualityCompositeScore: 0.9,
    poolingAware: true,
    releaseSafe: true,
    reason: "Quality passed.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_ECONOMICS") {
  throw new Error("Expected invalid-economics refusal.");
}

console.log("SMOKE_PNL_INVALID_ECONOMICS=PASS");