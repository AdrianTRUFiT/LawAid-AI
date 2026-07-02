import { runBookingReadyFormationBridge } from "../src/index.js";

const result = runBookingReadyFormationBridge({
  subjectId: "book_003",
  poolingThreshold: {
    poolingThresholdId: "pool_book_003",
    subjectId: "book_003",
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
    qualityGateId: "qual_book_003",
    subjectId: "book_003",
    qualityGateStatus: "QUALITY_HELD",
    qualityScore: 0.55,
    providerReliabilityScore: 0.58,
    qualityCompositeScore: 0.56,
    poolingAware: true,
    releaseSafe: false,
    reason: "Quality held.",
    createdAt: new Date().toISOString(),
  },
  pnlGuard: {
    pnlGuardId: "pnl_book_003",
    subjectId: "book_003",
    pnlGuardStatus: "PNL_HELD",
    expectedRevenueMinor: 20000,
    expectedCostMinor: 18000,
    expectedMarginMinor: 2000,
    expectedMarginRatio: 0.1,
    releaseEconomicallySafe: false,
    reason: "Economics held.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.bookingReadyStatus !== "BOOKING_BLOCKED") {
  throw new Error("Expected quality-held block.");
}

console.log("SMOKE_BOOKING_READY_QUALITY_HELD_BLOCK=PASS");