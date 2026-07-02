import { runActivatedTransactionStateEmissionBridge } from "../src/index.js";

const result = runActivatedTransactionStateEmissionBridge({
  subjectId: "ats_005",
  fundTrackerIntake: {
    fundTrackerIntakeNormalizationId: "fundtracker_intake_ats_005",
    subjectId: "wrong_ats",
    fundTrackerIntakeStatus: "FUNDTRACKER_INTAKE_READY",
    handoffCandidateId: "fundtracker_handoff_005",
    routeTarget: "FundTrackerAI",
    normalizedForTransact: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_ACTIVATED_TRANSACTION_STATE_SUBJECT_MISMATCH=PASS");