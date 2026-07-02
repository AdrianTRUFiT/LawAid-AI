import { runBookingIntentToTransactionIntentBridge } from "../src/index.js";

const result = runBookingIntentToTransactionIntentBridge({
  subjectId: "txc_001",
  transactionAmountMinor: 25000,
  currency: "USD",
  paymentWindowOpen: true,
  verifiedBookingIntent: {
    verifiedBookingIntentId: "verified_booking_intent_txc_001",
    subjectId: "txc_001",
    verifiedBookingIntentStatus: "VERIFIED_BOOKING_INTENT_READY",
    offerId: "offer_001",
    offerClass: "pooled_offer",
    downstreamTransactionEligible: true,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.transactionIntentCandidateStatus !== "TRANSACTION_INTENT_READY") {
  throw new Error("Expected ready booking intent pass.");
}

console.log("SMOKE_TX_INTENT_READY=PASS");