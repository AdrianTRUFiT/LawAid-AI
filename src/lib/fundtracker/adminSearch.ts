import { getApprovedReviewRecords } from "./approvedReviewStore";
import { getPermanentRefusals, getReviewAuditLog } from "./reviewAudit";
import { getReviewEventHistory } from "./reviewEventHistory";
import { getReviewQueue } from "./reviewQueue";

export function findReviewsByMerchant(merchantId: string) {
  return getReviewQueue().filter((item) => item.merchantId === merchantId);
}

export function findReviewsByStatus(
  status: "pending_review" | "approved" | "rejected",
) {
  return getReviewQueue().filter((item) => item.status === status);
}

export function findReviewAuditsByReviewer(reviewerId: string) {
  return getReviewAuditLog().filter((item) => item.reviewerId === reviewerId);
}

export function findEventsByReviewer(reviewerId: string) {
  return getReviewEventHistory().filter((item) => item.reviewerId === reviewerId);
}

export function findApprovedReviewsByReviewer(reviewerId: string) {
  return getApprovedReviewRecords().filter((item) => item.reviewerId === reviewerId);
}

export function findPermanentRefusalsByReviewer(reviewerId: string) {
  return getPermanentRefusals().filter((item) => item.reviewerId === reviewerId);
}

export function buildAdminSnapshot() {
  const queue = getReviewQueue();
  const audits = getReviewAuditLog();
  const events = getReviewEventHistory();
  const approved = getApprovedReviewRecords();
  const refusals = getPermanentRefusals();

  return {
    queueCount: queue.length,
    pendingCount: queue.filter((item) => item.status === "pending_review").length,
    approvedCount: queue.filter((item) => item.status === "approved").length,
    rejectedCount: queue.filter((item) => item.status === "rejected").length,
    auditCount: audits.length,
    eventCount: events.length,
    activatedFromReviewCount: approved.length,
    permanentRefusalCount: refusals.length,
  };
}
