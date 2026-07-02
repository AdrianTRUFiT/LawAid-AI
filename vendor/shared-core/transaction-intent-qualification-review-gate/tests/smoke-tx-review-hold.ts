import { runTransactionIntentQualificationReviewGate } from "../src/index.js";

const result = runTransactionIntentQualificationReviewGate({
  subjectId: "qualtx_002",
  riskScore: 0.4,
  completenessScore: 0.5,
  transactionIntentCandidate: {
    transactionIntentCandidateId: "tx_intent_candidate_qualtx_002",
    subjectId: "qualtx_002",
    transactionIntentCandidateStatus: "TRANSACTION_INTENT_READY",
    bookingIntentId: "booking_002",
    offerClass: "pooled_offer",
    transactionAmountMinor: 25000,
    currency: "USD",
    downstreamReviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.transactionQualificationStatus !== "TRANSACTION_REVIEW") {
  throw new Error("Expected review hold.");
}

console.log("SMOKE_TX_REVIEW_HOLD=PASS");