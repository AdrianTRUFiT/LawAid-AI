import {
  buildAdminSnapshot,
  findApprovedReviewsByReviewer,
  findEventsByReviewer,
  findPermanentRefusalsByReviewer,
  findReviewAuditsByReviewer,
  findReviewsByMerchant,
  findReviewsByStatus,
} from "../../lib/fundtracker/adminSearch";

export function getAdminSnapshotApi() {
  return {
    ok: true,
    artifactType: "AdminSnapshot",
    payload: buildAdminSnapshot(),
  };
}

export function getReviewsByMerchantApi(merchantId: string) {
  return {
    ok: true,
    artifactType: "MerchantReviewList",
    payload: findReviewsByMerchant(merchantId),
  };
}

export function getReviewsByStatusApi(
  status: "pending_review" | "approved" | "rejected",
) {
  return {
    ok: true,
    artifactType: "StatusReviewList",
    payload: findReviewsByStatus(status),
  };
}

export function getReviewerActivityApi(reviewerId: string) {
  return {
    ok: true,
    artifactType: "ReviewerActivity",
    payload: {
      audits: findReviewAuditsByReviewer(reviewerId),
      events: findEventsByReviewer(reviewerId),
      approvedReviews: findApprovedReviewsByReviewer(reviewerId),
      permanentRefusals: findPermanentRefusalsByReviewer(reviewerId),
    },
  };
}
