import type { ProcessorEvent, TransactionIntent } from "../../lib/fundtracker/types";
import {
  recordProcessorArtifact,
  recordProcessorEvent,
  recordTransactionIntentArtifact,
} from "../../lib/fundtracker";

export function recordProcessorEventApi(
  intent: TransactionIntent,
  payload: ProcessorEvent,
) {
  recordProcessorArtifact(payload);

  const updatedIntent = recordProcessorEvent(intent, payload);
  recordTransactionIntentArtifact(updatedIntent);

  return {
    ok: true,
    artifactType: "TransactionIntent",
    payload: updatedIntent,
  };
}
