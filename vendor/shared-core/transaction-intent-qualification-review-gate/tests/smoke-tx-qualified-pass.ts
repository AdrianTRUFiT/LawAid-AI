import { runTransactionIntentQualificationReviewGate } from "../src/index.js";

const result = runTransactionIntentQualificationReviewGate({
  subjectId: "qualtx_001",
  riskScore: 0.2,
  completenessScore: 0.9,
  transactionIntentCandidate: {
    transactionIntentCandidateId: "tx_intent_candidate_qualtx_001",
    subjectId: "qualtx_001",
    transactionIntentCandidateStatus: "TRANSACTION_INTENT_READY",
    bookingIntentId: "booking_001",
    offerClass: "pooled_offer",
    transactionAmountMinor: 25000,
    currency: "USD",
    downstreamReviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.transactionQualificationStatus !== "TRANSACTION_QUALIFIED") {
  throw new Error("Expected qualified pass.");
}

console.log("SMOKE_TX_QUALIFIED_PASS=PASS");