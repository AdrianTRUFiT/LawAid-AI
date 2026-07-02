import { runVerifiedBookingIntentBridge } from "../src/index.js";

const result = runVerifiedBookingIntentBridge({
  subjectId: "intent_003",
  preCommitmentOffer: {
    preCommitmentOfferId: "precommit_offer_intent_003",
    subjectId: "intent_003",
    preCommitmentOfferStatus: "OFFER_REFUSED",
    offerClass: "none",
    selectedSourceId: null,
    offerAmountMinor: 0,
    currency: "USD",
    commitmentWindowOpen: false,
    reason: "Refused.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.verifiedBookingIntentStatus !== "VERIFIED_BOOKING_INTENT_REFUSED") {
  throw new Error("Expected refused offer intent refusal.");
}

console.log("SMOKE_VERIFIED_BOOKING_INTENT_REFUSED=PASS");