import { runFundTrackerHandoffCandidateBridge } from "../src/index.js";

const result = runFundTrackerHandoffCandidateBridge({
  subjectId: "handoff_004",
  transactionQualification: {
    transactionQualificationId: "transaction_qualification_handoff_004",
    subjectId: "handoff_004",
    transactionQualificationStatus: "TRANSACTION_QUALIFIED",
    transactionIntentCandidateId: "tx_intent_candidate_handoff_004",
    riskScore: 0.1,
    completenessScore: 0.95,
    reviewRequired: false,
    reason: "Qualified.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.routeTarget !== "FundTrackerAI") {
  throw new Error("Expected route target correctness.");
}

console.log("SMOKE_FUNDTRACKER_ROUTE_TARGET=PASS");