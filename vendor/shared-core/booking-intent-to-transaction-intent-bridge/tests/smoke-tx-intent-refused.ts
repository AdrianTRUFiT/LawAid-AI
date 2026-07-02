import { runBookingIntentToTransactionIntentBridge } from "../src/index.js";

const result = runBookingIntentToTransactionIntentBridge({
  subjectId: "txc_003",
  transactionAmountMinor: 25000,
  currency: "USD",
  paymentWindowOpen: true,
  verifiedBookingIntent: {
    verifiedBookingIntentId: "verified_booking_intent_txc_003",
    subjectId: "txc_003",
    verifiedBookingIntentStatus: "VERIFIED_BOOKING_INTENT_REFUSED",
    offerId: "offer_003",
    offerClass: "none",
    downstreamTransactionEligible: false,
    reason: "Refused.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.transactionIntentCandidateStatus !== "TRANSACTION_INTENT_REFUSED") {
  throw new Error("Expected refused booking intent refusal.");
}

console.log("SMOKE_TX_INTENT_REFUSED=PASS");