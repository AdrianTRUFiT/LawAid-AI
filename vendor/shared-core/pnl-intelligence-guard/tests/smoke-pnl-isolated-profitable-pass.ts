import { runPnlIntelligenceGuard } from "../src/index.js";

const result = runPnlIntelligenceGuard({
  subjectId: "pnl_004",
  expectedRevenueMinor: 30000,
  expectedCostMinor: 18000,
  poolingThreshold: {
    poolingThresholdId: "pool_pnl_004",
    subjectId: "pnl_004",
    poolingStatus: "ISOLATED",
    currentDemandCount: 1,
    requiredThreshold: 1,
    thresholdGap: 0,
    releaseReady: false,
    poolingRecommended: false,
    reason: "Isolated.",
    createdAt: new Date().toISOString(),
  },
  qualityGate: {
    qualityGateId: "qual_pnl_004",
    subjectId: "pnl_004",
    qualityGateStatus: "QUALITY_PASSED",
    qualityScore: 0.84,
    providerReliabilityScore: 0.81,
    qualityCompositeScore: 0.83,
    poolingAware: false,
    releaseSafe: true,
    reason: "Quality passed.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.releaseEconomicallySafe !== true) {
  throw new Error("Expected isolated profitable pass.");
}

console.log("SMOKE_PNL_ISOLATED_PROFITABLE_PASS=PASS");