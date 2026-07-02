import { getApprovedReviewRecords } from "../fundtracker/approvedReviewStore";
import { getPermanentRefusals, getReviewAuditLog } from "../fundtracker/reviewAudit";
import { getReviewQueue } from "../fundtracker/reviewQueue";
import { classifyArtifact } from "./contracts";
import { sanitizeByArtifactType } from "./sanitizer";

export function buildPrivacyInventory() {
  const reviewQueue = getReviewQueue().map((item) => ({
    artifactType: "ReviewQueueItem",
    privacy: classifyArtifact("ReviewQueueItem", item as unknown as Record<string, unknown>),
    preview: sanitizeByArtifactType("ReviewQueueItem", item as unknown as Record<string, unknown>),
  }));

  const reviewAudits = getReviewAuditLog().map((item) => ({
    artifactType: "ReviewAuditRecord",
    privacy: classifyArtifact("ReviewAuditRecord", item as unknown as Record<string, unknown>),
    preview: sanitizeByArtifactType("ReviewAuditRecord", item as unknown as Record<string, unknown>),
  }));

  const permanentRefusals = getPermanentRefusals().map((item) => ({
    artifactType: "PermanentRefusalRecord",
    privacy: classifyArtifact("PermanentRefusalRecord", item as unknown as Record<string, unknown>),
    preview: sanitizeByArtifactType("PermanentRefusalRecord", item as unknown as Record<string, unknown>),
  }));

  const approvedReviews = getApprovedReviewRecords().map((item) => ({
    artifactType: "ApprovedReviewRecord",
    privacy: classifyArtifact("ApprovedReviewRecord", item as unknown as Record<string, unknown>),
    preview: sanitizeByArtifactType("ApprovedReviewRecord", item as unknown as Record<string, unknown>),
  }));

  return {
    reviewQueue,
    reviewAudits,
    permanentRefusals,
    approvedReviews,
    summary: {
      reviewQueueCount: reviewQueue.length,
      reviewAuditCount: reviewAudits.length,
      permanentRefusalCount: permanentRefusals.length,
      approvedReviewCount: approvedReviews.length,
    },
  };
}
