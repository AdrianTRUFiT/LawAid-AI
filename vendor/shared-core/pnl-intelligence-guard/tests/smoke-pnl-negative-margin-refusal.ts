import { runPnlIntelligenceGuard } from "../src/index.js";

const result = runPnlIntelligenceGuard({
  subjectId: "pnl_003",
  expectedRevenueMinor: 10000,
  expectedCostMinor: 12000,
  poolingThreshold: {
    poolingThresholdId: "pool_pnl_003",
    subjectId: "pnl_003",
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
    qualityGateId: "qual_pnl_003",
    subjectId: "pnl_003",
    qualityGateStatus: "QUALITY_PASSED",
    qualityScore: 0.85,
    providerReliabilityScore: 0.82,
    qualityCompositeScore: 0.84,
    poolingAware: false,
    releaseSafe: true,
    reason: "Quality passed.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.pnlGuardStatus !== "PNL_REFUSED") {
  throw new Error("Expected negative-margin refusal.");
}

console.log("SMOKE_PNL_NEGATIVE_MARGIN_REFUSAL=PASS");