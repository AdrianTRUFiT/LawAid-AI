import { runFundTrackerIntakeNormalizationBridge } from "../src/index.js";

const result = runFundTrackerIntakeNormalizationBridge({
  subjectId: "fti_005",
  fundTrackerHandoffCandidate: {
    fundTrackerHandoffCandidateId: "fundtracker_handoff_fti_005",
    subjectId: "wrong_fti",
    fundTrackerHandoffCandidateStatus: "FUNDTRACKER_HANDOFF_READY",
    transactionQualificationId: "transaction_qualification_005",
    routeTarget: "FundTrackerAI",
    handoffReady: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_FUNDTRACKER_INTAKE_SUBJECT_MISMATCH=PASS");