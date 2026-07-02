import { runReceivingEnvironmentHandoffBridge } from "../src/index.js";

const result = runReceivingEnvironmentHandoffBridge({
  subjectId: "reh_002",
  activatedTransactionStateEmission: {
    activatedTransactionStateEmissionId: "activated_tx_state_reh_002",
    subjectId: "reh_002",
    activatedTransactionEmissionStatus: "ACTIVATED_TRANSACTION_STATE_HELD",
    fundTrackerIntakeNormalizationId: "fundtracker_intake_002",
    artifactType: "ActivatedTransactionState",
    transactTruthReady: false,
    reviewRequired: true,
    reason: "Held.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.receivingEnvironmentHandoffStatus !== "RECEIVING_ENVIRONMENT_HANDOFF_HELD") {
  throw new Error("Expected held receiving handoff hold.");
}

console.log("SMOKE_RECEIVING_HANDOFF_HELD=PASS");