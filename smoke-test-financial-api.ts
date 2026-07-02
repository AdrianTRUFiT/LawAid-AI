import {
  sampleProcessorEvent,
  sampleVerifiedOpportunity,
} from "./src/lib/fundtracker";
import { createTransactionIntentApi } from "./src/api/fundtracker/createTransactionIntent";
import { recordProcessorEventApi } from "./src/api/fundtracker/recordProcessorEvent";
import { verifyCommitmentApi } from "./src/api/fundtracker/verifyCommitment";
import { getTransactionStateApi } from "./src/api/fundtracker/getTransactionState";
import { ingestTransactionSummaryApi } from "./src/api/fintechion/ingestTransactionSummary";
import { buildOversightStateApi } from "./src/api/fintechion/buildOversightState";
import { getOversightStateApi } from "./src/api/fintechion/getOversightState";

const created = createTransactionIntentApi(sampleVerifiedOpportunity);
const recorded = recordProcessorEventApi(created.payload, sampleProcessorEvent);
const verified = verifyCommitmentApi(recorded.payload, sampleProcessorEvent);

console.log("CREATE_OK=", created.ok);
console.log("RECORD_OK=", recorded.ok);
console.log("VERIFY_OK=", verified.ok);

if (verified.ok) {
  ingestTransactionSummaryApi(verified.payload);
  const oversight = buildOversightStateApi("2026-04", 0, 0);
  const txState = getTransactionStateApi(verified.payload.transactionId);
  const oversightState = getOversightStateApi();

  console.log("TX_STATE_OK=", txState.ok);
  console.log("OVERSIGHT_OK=", oversight.ok);
  console.log("OVERSIGHT_STATE_OK=", oversightState.ok);
  console.log("OVERSIGHT_HEALTH=", oversight.payload.merchantHealthState);
  console.log("OVERSIGHT_ANOMALY_COUNT=", oversight.payload.anomalyFlags.length);
} else {
  console.log("VERIFY_ARTIFACT_TYPE=", verified.artifactType);
}
