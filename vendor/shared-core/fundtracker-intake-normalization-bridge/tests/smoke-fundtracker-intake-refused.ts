import { runFundTrackerIntakeNormalizationBridge } from "../src/index.js";

const result = runFundTrackerIntakeNormalizationBridge({
  subjectId: "fti_003",
  fundTrackerHandoffCandidate: {
    fundTrackerHandoffCandidateId: "fundtracker_handoff_fti_003",
    subjectId: "fti_003",
    fundTrackerHandoffCandidateStatus: "FUNDTRACKER_HANDOFF_REFUSED",
    transactionQualificationId: "transaction_qualification_003",
    routeTarget: "FundTrackerAI",
    handoffReady: false,
    reviewRequired: false,
    reason: "Refused.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.fundTrackerIntakeStatus !== "FUNDTRACKER_INTAKE_REFUSED") {
  throw new Error("Expected refused handoff normalization refusal.");
}

console.log("SMOKE_FUNDTRACKER_INTAKE_REFUSED=PASS");