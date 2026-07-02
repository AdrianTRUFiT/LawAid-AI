import { runVerifiedBookingIntentBridge } from "../src/index.js";

const result = runVerifiedBookingIntentBridge({
  subjectId: "intent_004",
  preCommitmentOffer: {
    preCommitmentOfferId: "precommit_offer_intent_004",
    subjectId: "intent_004",
    preCommitmentOfferStatus: "OFFER_READY",
    offerClass: "isolated_offer",
    selectedSourceId: "iso_a",
    offerAmountMinor: 18000,
    currency: "USD",
    commitmentWindowOpen: false,
    reason: "Window closed.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.verifiedBookingIntentStatus !== "VERIFIED_BOOKING_INTENT_HELD") {
  throw new Error("Expected closed commitment window hold.");
}

console.log("SMOKE_VERIFIED_BOOKING_INTENT_WINDOW_HELD=PASS");