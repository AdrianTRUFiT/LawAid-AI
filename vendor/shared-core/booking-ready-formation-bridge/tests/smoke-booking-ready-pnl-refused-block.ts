import { runBookingReadyFormationBridge } from "../src/index.js";

const result = runBookingReadyFormationBridge({
  subjectId: "book_004",
  poolingThreshold: {
    poolingThresholdId: "pool_book_004",
    subjectId: "book_004",
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
    qualityGateId: "qual_book_004",
    subjectId: "book_004",
    qualityGateStatus: "QUALITY_PASSED",
    qualityScore: 0.8,
    providerReliabilityScore: 0.8,
    qualityCompositeScore: 0.8,
    poolingAware: false,
    releaseSafe: true,
    reason: "Quality passed.",
    createdAt: new Date().toISOString(),
  },
  pnlGuard: {
    pnlGuardId: "pnl_book_004",
    subjectId: "book_004",
    pnlGuardStatus: "PNL_REFUSED",
    expectedRevenueMinor: 10000,
    expectedCostMinor: 12000,
    expectedMarginMinor: -2000,
    expectedMarginRatio: -0.2,
    releaseEconomicallySafe: false,
    reason: "Economics refused.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.bookingReadyStatus !== "BOOKING_BLOCKED") {
  throw new Error("Expected pnl-refused block.");
}

console.log("SMOKE_BOOKING_READY_PNL_REFUSED_BLOCK=PASS");