import { runPnlIntelligenceGuard } from "../src/index.js";

const result = runPnlIntelligenceGuard({
  subjectId: "pnl_002",
  expectedRevenueMinor: 10000,
  expectedCostMinor: 9200,
  poolingThreshold: {
    poolingThresholdId: "pool_pnl_002",
    subjectId: "pnl_002",
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
    qualityGateId: "qual_pnl_002",
    subjectId: "pnl_002",
    qualityGateStatus: "QUALITY_PASSED",
    qualityScore: 0.8,
    providerReliabilityScore: 0.8,
    qualityCompositeScore: 0.8,
    poolingAware: true,
    releaseSafe: true,
    reason: "Quality passed.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.pnlGuardStatus !== "PNL_HELD") {
  throw new Error("Expected thin-margin hold.");
}

console.log("SMOKE_PNL_THIN_MARGIN_HOLD=PASS");