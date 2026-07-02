import { runReceivingEnvironmentHandoffBridge } from "../src/index.js";

const result = runReceivingEnvironmentHandoffBridge({
  subjectId: "reh_004",
  activatedTransactionStateEmission: {
    activatedTransactionStateEmissionId: "activated_tx_state_reh_004",
    subjectId: "reh_004",
    activatedTransactionEmissionStatus: "ACTIVATED_TRANSACTION_STATE_READY",
    fundTrackerIntakeNormalizationId: "fundtracker_intake_004",
    artifactType: "ActivatedTransactionState",
    transactTruthReady: true,
    reviewRequired: false,
    reason: "Ready.",
    createdAt: new Date().toISOString(),
  },
});

if (!result.ok || !result.artifact || result.artifact.artifactTarget !== "ReceivingEnvironment") {
  throw new Error("Expected correct receiving artifact target.");
}

console.log("SMOKE_RECEIVING_HANDOFF_ARTIFACT_TARGET=PASS");