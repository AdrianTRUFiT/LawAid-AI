import { runReceivingEnvironmentHandoffBridge } from "../src/index.js";

const result = runReceivingEnvironmentHandoffBridge({
  subjectId: "reh_003",
  activatedTransactionStateEmission: {
    activatedTransactionStateEmissionId: "activated_tx_state_reh_003",
    subjectId: "reh_003",
    activatedTransactionEmissionStatus: "ACTIVATED_TRANSACTION_STATE_REFUSED",
    fundTrackerIntakeNormalizationId: "fundtracker_intake_003",
    artifactType: "ActivatedTransactionState",
    transactTruthReady: false,
    reviewRequired: false,
    reason: "Refused.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.receivingEnvironmentHandoffStatus !== "RECEIVING_ENVIRONMENT_HANDOFF_REFUSED") {
  throw new Error("Expected refused receiving handoff refusal.");
}

console.log("SMOKE_RECEIVING_HANDOFF_REFUSED=PASS");