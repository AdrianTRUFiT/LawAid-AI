import {
  approveReviewQueueItem,
  getPermanentRefusals,
  getReviewAuditLog,
  rejectReviewQueueItem,
} from "../../lib/fundtracker";

export function approveReviewQueueItemApi(
  reviewId: string,
  reviewerId: string,
  reviewerNote: string,
) {
  const result = approveReviewQueueItem(reviewId, reviewerId, reviewerNote);

  if (!result) {
    return {
      ok: false,
      message: `No review item found for reviewId=${reviewId}`,
    };
  }

  return {
    ok: true,
    artifactType: "ReviewApprovalOutcome",
    payload: result,
  };
}

export function rejectReviewQueueItemApi(
  reviewId: string,
  reviewerId: string,
  reviewerNote: string,
) {
  const result = rejectReviewQueueItem(reviewId, reviewerId, reviewerNote);

  if (!result) {
    return {
      ok: false,
      message: `No review item found for reviewId=${reviewId}`,
    };
  }

  return {
    ok: true,
    artifactType: "ReviewRejectionOutcome",
    payload: result,
  };
}

export function listReviewAuditLogApi() {
  return {
    ok: true,
    artifactType: "ReviewAuditLog",
    payload: getReviewAuditLog(),
  };
}

export function listPermanentRefusalsApi() {
  return {
    ok: true,
    artifactType: "PermanentRefusalList",
    payload: getPermanentRefusals(),
  };
}
