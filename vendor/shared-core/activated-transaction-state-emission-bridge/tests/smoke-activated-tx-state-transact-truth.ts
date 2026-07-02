import { runActivatedTransactionStateEmissionBridge } from "../src/index.js";

const result = runActivatedTransactionStateEmissionBridge({
  subjectId: "ats_004",
  fundTrackerIntake: {
    fundTrackerIntakeNormalizationId: "fundtracker_intake_ats_004",
    subjectId: "ats_004",
    fundTrackerIntakeStatus: "FUNDTRACKER_INTAKE_READY",
    handoffCandidateId: "fundtracker_handoff_004",
    routeTarget: "FundTrackerAI",
    normalizedForTransact: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.transactTruthReady !== true || result.artifact.artifactType !== "ActivatedTransactionState") {
  throw new Error("Expected transact normalization truth.");
}

console.log("SMOKE_ACTIVATED_TRANSACTION_STATE_TRANSACT_TRUTH=PASS");