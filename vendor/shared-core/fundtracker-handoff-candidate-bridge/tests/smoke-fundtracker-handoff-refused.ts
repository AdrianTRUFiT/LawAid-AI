import { runFundTrackerHandoffCandidateBridge } from "../src/index.js";

const result = runFundTrackerHandoffCandidateBridge({
  subjectId: "handoff_003",
  transactionQualification: {
    transactionQualificationId: "transaction_qualification_handoff_003",
    subjectId: "handoff_003",
    transactionQualificationStatus: "TRANSACTION_REFUSED",
    transactionIntentCandidateId: "tx_intent_candidate_handoff_003",
    riskScore: 0.3,
    completenessScore: 0.9,
    reviewRequired: false,
    reason: "Refused.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.fundTrackerHandoffCandidateStatus !== "FUNDTRACKER_HANDOFF_REFUSED") {
  throw new Error("Expected refused handoff path.");
}

console.log("SMOKE_FUNDTRACKER_HANDOFF_REFUSED=PASS");