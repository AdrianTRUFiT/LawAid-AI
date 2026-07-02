import { runActivatedTransactionStateEmissionBridge } from "../src/index.js";

const result = runActivatedTransactionStateEmissionBridge({
  subjectId: "ats_002",
  fundTrackerIntake: {
    fundTrackerIntakeNormalizationId: "fundtracker_intake_ats_002",
    subjectId: "ats_002",
    fundTrackerIntakeStatus: "FUNDTRACKER_INTAKE_HELD",
    handoffCandidateId: "fundtracker_handoff_002",
    routeTarget: "FundTrackerAI",
    normalizedForTransact: false,
    reviewRequired: true,
    reason: "Held.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.activatedTransactionEmissionStatus !== "ACTIVATED_TRANSACTION_STATE_HELD") {
  throw new Error("Expected held intake emission hold.");
}

console.log("SMOKE_ACTIVATED_TRANSACTION_STATE_HELD=PASS");