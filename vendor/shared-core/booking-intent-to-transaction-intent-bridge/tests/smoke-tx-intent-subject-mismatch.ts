import { runBookingIntentToTransactionIntentBridge } from "../src/index.js";

const result = runBookingIntentToTransactionIntentBridge({
  subjectId: "txc_005",
  transactionAmountMinor: 25000,
  currency: "USD",
  paymentWindowOpen: true,
  verifiedBookingIntent: {
    verifiedBookingIntentId: "verified_booking_intent_txc_005",
    subjectId: "wrong_txc",
    verifiedBookingIntentStatus: "VERIFIED_BOOKING_INTENT_READY",
    offerId: "offer_005",
    offerClass: "pooled_offer",
    downstreamTransactionEligible: true,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_TX_INTENT_SUBJECT_MISMATCH=PASS");