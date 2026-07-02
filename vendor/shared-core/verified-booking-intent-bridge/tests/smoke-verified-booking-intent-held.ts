import { runVerifiedBookingIntentBridge } from "../src/index.js";

const result = runVerifiedBookingIntentBridge({
  subjectId: "intent_002",
  preCommitmentOffer: {
    preCommitmentOfferId: "precommit_offer_intent_002",
    subjectId: "intent_002",
    preCommitmentOfferStatus: "OFFER_HELD",
    offerClass: "pooled_offer",
    selectedSourceId: "pool_b",
    offerAmountMinor: 25000,
    currency: "USD",
    commitmentWindowOpen: false,
    reason: "Held.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.verifiedBookingIntentStatus !== "VERIFIED_BOOKING_INTENT_HELD") {
  throw new Error("Expected held offer intent hold.");
}

console.log("SMOKE_VERIFIED_BOOKING_INTENT_HELD=PASS");