import { runReceivingEnvironmentHandoffBridge } from "../src/index.js";

const result = runReceivingEnvironmentHandoffBridge({
  subjectId: "reh_001",
  activatedTransactionStateEmission: {
    activatedTransactionStateEmissionId: "activated_tx_state_reh_001",
    subjectId: "reh_001",
    activatedTransactionEmissionStatus: "ACTIVATED_TRANSACTION_STATE_READY",
    fundTrackerIntakeNormalizationId: "fundtracker_intake_001",
    artifactType: "ActivatedTransactionState",
    transactTruthReady: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.receivingEnvironmentHandoffStatus !== "RECEIVING_ENVIRONMENT_HANDOFF_READY") {
  throw new Error("Expected ready receiving handoff pass.");
}

console.log("SMOKE_RECEIVING_HANDOFF_READY=PASS");