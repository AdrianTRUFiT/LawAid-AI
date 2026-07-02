import { runVerifiedBookingIntentBridge } from "../src/index.js";

const result = runVerifiedBookingIntentBridge({
  subjectId: "intent_001",
  preCommitmentOffer: {
    preCommitmentOfferId: "precommit_offer_intent_001",
    subjectId: "intent_001",
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

if (!result.ok || !result.artifact || result.artifact.verifiedBookingIntentStatus !== "VERIFIED_BOOKING_INTENT_READY") {
  throw new Error("Expected ready offer intent success.");
}

console.log("SMOKE_VERIFIED_BOOKING_INTENT_READY=PASS");