import { runVerifiedBookingIntentBridge } from "../src/index.js";

const result = runVerifiedBookingIntentBridge({
  subjectId: "intent_005",
  preCommitmentOffer: {
    preCommitmentOfferId: "precommit_offer_intent_005",
    subjectId: "wrong_intent",
    preCommitmentOfferStatus: "OFFER_READY",
    offerClass: "pooled_offer",
    selectedSourceId: "pool_a",
    offerAmountMinor: 25000,
    currency: "USD",
    commitmentWindowOpen: true,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_VERIFIED_BOOKING_INTENT_SUBJECT_MISMATCH=PASS");