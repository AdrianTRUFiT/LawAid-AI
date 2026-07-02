import { runFundTrackerHandoffCandidateBridge } from "../src/index.js";

const result = runFundTrackerHandoffCandidateBridge({
  subjectId: "handoff_001",
  transactionQualification: {
    transactionQualificationId: "transaction_qualification_handoff_001",
    subjectId: "handoff_001",
    transactionQualificationStatus: "TRANSACTION_QUALIFIED",
    transactionIntentCandidateId: "tx_intent_candidate_handoff_001",
    riskScore: 0.2,
    completenessScore: 0.9,
    reviewRequired: false,
    reason: "Qualified.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.fundTrackerHandoffCandidateStatus !== "FUNDTRACKER_HANDOFF_READY") {
  throw new Error("Expected handoff-ready pass.");
}

console.log("SMOKE_FUNDTRACKER_HANDOFF_READY=PASS");