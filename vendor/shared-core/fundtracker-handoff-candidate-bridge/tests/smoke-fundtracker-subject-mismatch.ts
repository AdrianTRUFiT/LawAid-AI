import { runFundTrackerHandoffCandidateBridge } from "../src/index.js";

const result = runFundTrackerHandoffCandidateBridge({
  subjectId: "handoff_005",
  transactionQualification: {
    transactionQualificationId: "transaction_qualification_handoff_005",
    subjectId: "wrong_handoff",
    transactionQualificationStatus: "TRANSACTION_QUALIFIED",
    transactionIntentCandidateId: "tx_intent_candidate_handoff_005",
    riskScore: 0.2,
    completenessScore: 0.9,
    reviewRequired: false,
    reason: "Qualified.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_FUNDTRACKER_SUBJECT_MISMATCH=PASS");