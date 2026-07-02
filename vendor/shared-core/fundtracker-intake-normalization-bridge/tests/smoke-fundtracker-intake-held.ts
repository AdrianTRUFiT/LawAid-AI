import { runFundTrackerIntakeNormalizationBridge } from "../src/index.js";

const result = runFundTrackerIntakeNormalizationBridge({
  subjectId: "fti_002",
  fundTrackerHandoffCandidate: {
    fundTrackerHandoffCandidateId: "fundtracker_handoff_fti_002",
    subjectId: "fti_002",
    fundTrackerHandoffCandidateStatus: "FUNDTRACKER_HANDOFF_HELD",
    transactionQualificationId: "transaction_qualification_002",
    routeTarget: "FundTrackerAI",
    handoffReady: false,
    reviewRequired: true,
    reason: "Held.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.fundTrackerIntakeStatus !== "FUNDTRACKER_INTAKE_HELD") {
  throw new Error("Expected held handoff normalization hold.");
}

console.log("SMOKE_FUNDTRACKER_INTAKE_HELD=PASS");