import { runBookingReadyFormationBridge } from "../src/index.js";

const result = runBookingReadyFormationBridge({
  subjectId: "book_005",
  poolingThreshold: {
    poolingThresholdId: "pool_book_005",
    subjectId: "wrong_book",
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
    qualityGateId: "qual_book_005",
    subjectId: "book_005",
    qualityGateStatus: "QUALITY_PASSED",
    qualityScore: 0.9,
    providerReliabilityScore: 0.9,
    qualityCompositeScore: 0.9,
    poolingAware: true,
    releaseSafe: true,
    reason: "Quality passed.",
    createdAt: new Date().toISOString(),
  },
  pnlGuard: {
    pnlGuardId: "pnl_book_005",
    subjectId: "book_005",
    pnlGuardStatus: "PNL_PASSED",
    expectedRevenueMinor: 50000,
    expectedCostMinor: 30000,
    expectedMarginMinor: 20000,
    expectedMarginRatio: 0.4,
    releaseEconomicallySafe: true,
    reason: "Economics passed.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_BOOKING_READY_SUBJECT_MISMATCH=PASS");