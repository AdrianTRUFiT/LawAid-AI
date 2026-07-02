import { runBookingReadyFormationBridge } from "../src/index.js";

const result = runBookingReadyFormationBridge({
  subjectId: "book_002",
  poolingThreshold: {
    poolingThresholdId: "pool_book_002",
    subjectId: "book_002",
    poolingStatus: "POOLING_PENDING",
    currentDemandCount: 2,
    requiredThreshold: 5,
    thresholdGap: 3,
    releaseReady: false,
    poolingRecommended: true,
    reason: "Pooling pending.",
    createdAt: new Date().toISOString(),
  },
  qualityGate: {
    qualityGateId: "qual_book_002",
    subjectId: "book_002",
    qualityGateStatus: "QUALITY_PASSED",
    qualityScore: 0.9,
    providerReliabilityScore: 0.9,
    qualityCompositeScore: 0.9,
    poolingAware: true,
    releaseSafe: false,
    reason: "Quality passed but waiting.",
    createdAt: new Date().toISOString(),
  },
  pnlGuard: {
    pnlGuardId: "pnl_book_002",
    subjectId: "book_002",
    pnlGuardStatus: "PNL_PASSED",
    expectedRevenueMinor: 50000,
    expectedCostMinor: 30000,
    expectedMarginMinor: 20000,
    expectedMarginRatio: 0.4,
    releaseEconomicallySafe: false,
    reason: "Economics passed but waiting.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.bookingReadyStatus !== "BOOKING_HELD") {
  throw new Error("Expected pooling-pending hold.");
}

console.log("SMOKE_BOOKING_READY_POOLING_PENDING=PASS");