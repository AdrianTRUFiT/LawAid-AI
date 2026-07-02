import type { VerifiedOpportunity } from "../../lib/fundtracker/types";
import {
  createTransactionIntent,
  recordTransactionIntentArtifact,
  recordVerifiedOpportunity,
} from "../../lib/fundtracker";

export function createTransactionIntentApi(
  payload: VerifiedOpportunity,
) {
  recordVerifiedOpportunity(payload);

  const intent = createTransactionIntent(payload);
  recordTransactionIntentArtifact(intent);

  return {
    ok: true,
    artifactType: "TransactionIntent",
    payload: intent,
  };
}
