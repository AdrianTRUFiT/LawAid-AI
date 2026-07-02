import { runTransactionIntentQualificationReviewGate } from "../src/index.js";

const result = runTransactionIntentQualificationReviewGate({
  subjectId: "qualtx_004",
  riskScore: 0.9,
  completenessScore: 0.95,
  transactionIntentCandidate: {
    transactionIntentCandidateId: "tx_intent_candidate_qualtx_004",
    subjectId: "qualtx_004",
    transactionIntentCandidateStatus: "TRANSACTION_INTENT_READY",
    bookingIntentId: "booking_004",
    offerClass: "isolated_offer",
    transactionAmountMinor: 18000,
    currency: "USD",
    downstreamReviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.transactionQualificationStatus !== "TRANSACTION_REVIEW") {
  throw new Error("Expected high-risk review hold.");
}

console.log("SMOKE_TX_HIGH_RISK_REVIEW=PASS");