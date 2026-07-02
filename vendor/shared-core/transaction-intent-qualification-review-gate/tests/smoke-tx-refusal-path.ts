import { runTransactionIntentQualificationReviewGate } from "../src/index.js";

const result = runTransactionIntentQualificationReviewGate({
  subjectId: "qualtx_003",
  riskScore: 0.2,
  completenessScore: 0.9,
  transactionIntentCandidate: {
    transactionIntentCandidateId: "tx_intent_candidate_qualtx_003",
    subjectId: "qualtx_003",
    transactionIntentCandidateStatus: "TRANSACTION_INTENT_REFUSED",
    bookingIntentId: "booking_003",
    offerClass: "none",
    transactionAmountMinor: 0,
    currency: "USD",
    downstreamReviewRequired: true,
    reason: "Refused.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.transactionQualificationStatus !== "TRANSACTION_REFUSED") {
  throw new Error("Expected refusal path.");
}

console.log("SMOKE_TX_REFUSAL_PATH=PASS");