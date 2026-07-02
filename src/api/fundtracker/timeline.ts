import {
  buildMerchantTimeline,
  buildTransactionTimeline,
} from "../../lib/fundtracker/timeline";

export function getTransactionTimelineApi(transactionId: string) {
  return {
    ok: true,
    artifactType: "TransactionTimeline",
    payload: buildTransactionTimeline(transactionId),
  };
}

export function getMerchantTimelineApi(merchantId: string) {
  return {
    ok: true,
    artifactType: "MerchantTimeline",
    payload: buildMerchantTimeline(merchantId),
  };
}
