import { runActivatedTransactionStateEmissionBridge } from "../src/index.js";

const result = runActivatedTransactionStateEmissionBridge({
  subjectId: "ats_001",
  fundTrackerIntake: {
    fundTrackerIntakeNormalizationId: "fundtracker_intake_ats_001",
    subjectId: "ats_001",
    fundTrackerIntakeStatus: "FUNDTRACKER_INTAKE_READY",
    handoffCandidateId: "fundtracker_handoff_001",
    routeTarget: "FundTrackerAI",
    normalizedForTransact: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.activatedTransactionEmissionStatus !== "ACTIVATED_TRANSACTION_STATE_READY") {
  throw new Error("Expected ready intake emission pass.");
}

console.log("SMOKE_ACTIVATED_TRANSACTION_STATE_READY=PASS");