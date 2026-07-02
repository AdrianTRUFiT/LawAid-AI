import { runReceivingEnvironmentHandoffBridge } from "../src/index.js";

const result = runReceivingEnvironmentHandoffBridge({
  subjectId: "reh_005",
  activatedTransactionStateEmission: {
    activatedTransactionStateEmissionId: "activated_tx_state_reh_005",
    subjectId: "wrong_reh",
    activatedTransactionEmissionStatus: "ACTIVATED_TRANSACTION_STATE_READY",
    fundTrackerIntakeNormalizationId: "fundtracker_intake_005",
    artifactType: "ActivatedTransactionState",
    transactTruthReady: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (result.ok || result.refusal?.refusalCode !== "SUBJECT_MISMATCH") {
  throw new Error("Expected subject mismatch refusal.");
}

console.log("SMOKE_RECEIVING_HANDOFF_SUBJECT_MISMATCH=PASS");