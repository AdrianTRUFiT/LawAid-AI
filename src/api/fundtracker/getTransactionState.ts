import { getFundTrackerArtifacts } from "../../lib/fundtracker";

export function getTransactionStateApi(transactionId: string) {
  const artifacts = getFundTrackerArtifacts();

  const activated = artifacts.activatedTransactionStates.find(
    (item) => item.transactionId === transactionId,
  );

  if (activated) {
    return {
      ok: true,
      artifactType: "ActivatedTransactionState",
      payload: activated,
    };
  }

  const intent = artifacts.transactionIntents
    .slice()
    .reverse()
    .find((item) => item.transactionId === transactionId);

  if (intent) {
    return {
      ok: true,
      artifactType: "TransactionIntent",
      payload: intent,
    };
  }

  return {
    ok: false,
    message: `No transaction state found for transactionId=${transactionId}`,
  };
}
