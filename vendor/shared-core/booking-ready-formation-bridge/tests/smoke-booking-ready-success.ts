import { runBookingReadyFormationBridge } from "../src/index.js";

const result = runBookingReadyFormationBridge({
  subjectId: "book_001",
  poolingThreshold: {
    poolingThresholdId: "pool_book_001",
    subjectId: "book_001",
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
    qualityGateId: "qual_book_001",
    subjectId: "book_001",
    qualityGateStatus: "QUALITY_PASSED",
    qualityScore: 0.9,
    providerReliabilityScore: 0.85,
    qualityCompositeScore: 0.88,
    poolingAware: true,
    releaseSafe: true,
    reason: "Quality passed.",
    createdAt: new Date().toISOString(),
  },
  pnlGuard: {
    pnlGuardId: "pnl_book_001",
    subjectId: "book_001",
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

if (!result.ok || !result.artifact || result.artifact.bookingReadyStatus !== "BOOKING_READY" || result.artifact.sourcingMode !== "pooled") {
  throw new Error("Expected booking-ready success.");
}

console.log("SMOKE_BOOKING_READY_SUCCESS=PASS");