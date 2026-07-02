import { runBookingIntentToTransactionIntentBridge } from "../src/index.js";

const result = runBookingIntentToTransactionIntentBridge({
  subjectId: "txc_004",
  transactionAmountMinor: 18000,
  currency: "USD",
  paymentWindowOpen: false,
  verifiedBookingIntent: {
    verifiedBookingIntentId: "verified_booking_intent_txc_004",
    subjectId: "txc_004",
    verifiedBookingIntentStatus: "VERIFIED_BOOKING_INTENT_READY",
    offerId: "offer_004",
    offerClass: "isolated_offer",
    downstreamTransactionEligible: true,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.transactionIntentCandidateStatus !== "TRANSACTION_INTENT_HELD") {
  throw new Error("Expected closed payment window hold.");
}

console.log("SMOKE_TX_INTENT_WINDOW_HELD=PASS");