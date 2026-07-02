import { runPnlIntelligenceGuard } from "../src/index.js";

const result = runPnlIntelligenceGuard({
  subjectId: "pnl_001",
  expectedRevenueMinor: 50000,
  expectedCostMinor: 30000,
  poolingThreshold: {
    poolingThresholdId: "pool_pnl_001",
    subjectId: "pnl_001",
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
    qualityGateId: "qual_pnl_001",
    subjectId: "pnl_001",
    qualityGateStatus: "QUALITY_PASSED",
    qualityScore: 0.9,
    providerReliabilityScore: 0.85,
    qualityCompositeScore: 0.88,
    poolingAware: true,
    releaseSafe: true,
    reason: "Quality passed.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.pnlGuardStatus !== "PNL_PASSED" || result.artifact.releaseEconomicallySafe !== true) {
  throw new Error("Expected profitable guard pass.");
}

console.log("SMOKE_PNL_PROFITABLE_PASS=PASS");