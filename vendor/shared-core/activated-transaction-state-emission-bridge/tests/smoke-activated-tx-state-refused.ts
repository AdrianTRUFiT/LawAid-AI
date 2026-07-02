import { runActivatedTransactionStateEmissionBridge } from "../src/index.js";

const result = runActivatedTransactionStateEmissionBridge({
  subjectId: "ats_003",
  fundTrackerIntake: {
    fundTrackerIntakeNormalizationId: "fundtracker_intake_ats_003",
    subjectId: "ats_003",
    fundTrackerIntakeStatus: "FUNDTRACKER_INTAKE_REFUSED",
    handoffCandidateId: "fundtracker_handoff_003",
    routeTarget: "FundTrackerAI",
    normalizedForTransact: false,
    reviewRequired: false,
    reason: "Refused.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.activatedTransactionEmissionStatus !== "ACTIVATED_TRANSACTION_STATE_REFUSED") {
  throw new Error("Expected refused intake emission refusal.");
}

console.log("SMOKE_ACTIVATED_TRANSACTION_STATE_REFUSED=PASS");