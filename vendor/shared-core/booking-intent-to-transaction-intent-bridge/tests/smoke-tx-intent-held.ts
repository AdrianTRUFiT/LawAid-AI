import { runBookingIntentToTransactionIntentBridge } from "../src/index.js";

const result = runBookingIntentToTransactionIntentBridge({
  subjectId: "txc_002",
  transactionAmountMinor: 25000,
  currency: "USD",
  paymentWindowOpen: true,
  verifiedBookingIntent: {
    verifiedBookingIntentId: "verified_booking_intent_txc_002",
    subjectId: "txc_002",
    verifiedBookingIntentStatus: "VERIFIED_BOOKING_INTENT_HELD",
    offerId: "offer_002",
    offerClass: "pooled_offer",
    downstreamTransactionEligible: false,
    reason: "Held.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.transactionIntentCandidateStatus !== "TRANSACTION_INTENT_HELD") {
  throw new Error("Expected held booking intent hold.");
}

console.log("SMOKE_TX_INTENT_HELD=PASS");