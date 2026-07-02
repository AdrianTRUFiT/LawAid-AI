import { runFundTrackerIntakeNormalizationBridge } from "../src/index.js";

const result = runFundTrackerIntakeNormalizationBridge({
  subjectId: "fti_001",
  fundTrackerHandoffCandidate: {
    fundTrackerHandoffCandidateId: "fundtracker_handoff_fti_001",
    subjectId: "fti_001",
    fundTrackerHandoffCandidateStatus: "FUNDTRACKER_HANDOFF_READY",
    transactionQualificationId: "transaction_qualification_001",
    routeTarget: "FundTrackerAI",
    handoffReady: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.fundTrackerIntakeStatus !== "FUNDTRACKER_INTAKE_READY") {
  throw new Error("Expected ready handoff normalization pass.");
}

console.log("SMOKE_FUNDTRACKER_INTAKE_READY=PASS");