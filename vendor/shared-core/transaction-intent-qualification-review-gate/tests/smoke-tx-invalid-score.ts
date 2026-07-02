import { runTransactionIntentQualificationReviewGate } from "../src/index.js";

const result = runTransactionIntentQualificationReviewGate({
  subjectId: "qualtx_005",
  riskScore: 1.4,
  completenessScore: 0.9,
  transactionIntentCandidate: {
    transactionIntentCandidateId: "tx_intent_candidate_qualtx_005",
    subjectId: "qualtx_005",
    transactionIntentCandidateStatus: "TRANSACTION_INTENT_READY",
    bookingIntentId: "booking_005",
    offerClass: "pooled_offer",
    transactionAmountMinor: 25000,
    currency: "USD",
    downstreamReviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "INVALID_SCORE") {
  throw new Error("Expected invalid risk refusal.");
}

console.log("SMOKE_TX_INVALID_SCORE=PASS");