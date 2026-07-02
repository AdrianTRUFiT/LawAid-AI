import type { ActivatedTransactionState } from "../../lib/fundtracker/types";
import { ingestTransactionSummary } from "../../lib/fintechion";

export function ingestTransactionSummaryApi(
  payload: ActivatedTransactionState,
) {
  ingestTransactionSummary(payload);

  return {
    ok: true,
    artifactType: "ActivatedTransactionState",
    payload,
  };
}
