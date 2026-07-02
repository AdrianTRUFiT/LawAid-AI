import { runFundTrackerHandoffCandidateBridge } from "../src/index.js";

const result = runFundTrackerHandoffCandidateBridge({
  subjectId: "handoff_002",
  transactionQualification: {
    transactionQualificationId: "transaction_qualification_handoff_002",
    subjectId: "handoff_002",
    transactionQualificationStatus: "TRANSACTION_REVIEW",
    transactionIntentCandidateId: "tx_intent_candidate_handoff_002",
    riskScore: 0.82,
    completenessScore: 0.8,
    reviewRequired: true,
    reason: "Review.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.fundTrackerHandoffCandidateStatus !== "FUNDTRACKER_HANDOFF_HELD") {
  throw new Error("Expected review-held pass.");
}

console.log("SMOKE_FUNDTRACKER_HANDOFF_HELD=PASS");