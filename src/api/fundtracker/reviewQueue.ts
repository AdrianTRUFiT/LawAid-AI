import {
  addToReviewQueue,
  getReviewQueue,
  getReviewQueueItem,
  updateReviewQueueStatus,
} from "../../lib/fundtracker/reviewQueue";
import type { ProcessorEvent, TransactionIntent, VerificationDecision } from "../../lib/fundtracker/types";

export function addToReviewQueueApi(
  intent: TransactionIntent,
  processorEvent: ProcessorEvent,
  decision: VerificationDecision,
) {
  return {
    ok: true,
    artifactType: "ReviewQueueItem",
    payload: addToReviewQueue(intent, processorEvent, decision),
  };
}

export function listReviewQueueApi() {
  return {
    ok: true,
    artifactType: "ReviewQueueList",
    payload: getReviewQueue(),
  };
}

export function getReviewQueueItemApi(reviewId: string) {
  const item = getReviewQueueItem(reviewId);

  if (!item) {
    return {
      ok: false,
      message: `No review item found for reviewId=${reviewId}`,
    };
  }

  return {
    ok: true,
    artifactType: "ReviewQueueItem",
    payload: item,
  };
}

export function updateReviewQueueStatusApi(
  reviewId: string,
  status: "pending_review" | "approved" | "rejected",
) {
  const item = updateReviewQueueStatus(reviewId, status);

  if (!item) {
    return {
      ok: false,
      message: `No review item found for reviewId=${reviewId}`,
    };
  }

  return {
    ok: true,
    artifactType: "ReviewQueueItem",
    payload: item,
  };
}
