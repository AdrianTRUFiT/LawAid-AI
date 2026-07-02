import { runFundTrackerIntakeNormalizationBridge } from "../src/index.js";

const result = runFundTrackerIntakeNormalizationBridge({
  subjectId: "fti_004",
  fundTrackerHandoffCandidate: {
    fundTrackerHandoffCandidateId: "fundtracker_handoff_fti_004",
    subjectId: "fti_004",
    fundTrackerHandoffCandidateStatus: "FUNDTRACKER_HANDOFF_READY",
    transactionQualificationId: "transaction_qualification_004",
    routeTarget: "FundTrackerAI",
    handoffReady: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.routeTarget !== "FundTrackerAI") {
  throw new Error("Expected route target enforcement.");
}

console.log("SMOKE_FUNDTRACKER_INTAKE_ROUTE_TARGET=PASS");