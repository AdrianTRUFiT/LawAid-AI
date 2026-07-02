import { getApprovedReviewRecords } from "../fundtracker/approvedReviewStore";
import { getPermanentRefusals, getReviewAuditLog } from "../fundtracker/reviewAudit";
import { getReviewQueue } from "../fundtracker/reviewQueue";
import { getDeletionPolicy } from "./deletion";
import { classifyArtifact } from "./contracts";
import { getPrivacyRoleAssignment } from "./roles";
import { evaluateRetentionClass } from "./retention";
import { sanitizeByArtifactType } from "./sanitizer";

export function buildSubjectAccessBundle(subjectId: string) {
  const queue = getReviewQueue()
    .filter((item) => item.customerId === subjectId)
    .map((item) => ({
      artifactType: "ReviewQueueItem",
      privacy: classifyArtifact("ReviewQueueItem", item as unknown as Record<string, unknown>),
      retention: evaluateRetentionClass("dispute", item.createdAt),
      deletion: getDeletionPolicy("ReviewQueueItem"),
      roles: getPrivacyRoleAssignment("ReviewQueueItem"),
      preview: sanitizeByArtifactType("ReviewQueueItem", item as unknown as Record<string, unknown>),
    }));

  const approved = getApprovedReviewRecords()
    .filter((item) => item.activatedTransactionState.customerId === subjectId)
    .map((item) => ({
      artifactType: "ApprovedReviewRecord",
      privacy: classifyArtifact("ApprovedReviewRecord", item as unknown as Record<string, unknown>),
      retention: evaluateRetentionClass("compliance", item.approvedAt),
      deletion: getDeletionPolicy("ApprovedReviewRecord"),
      roles: getPrivacyRoleAssignment("ApprovedReviewRecord"),
      preview: sanitizeByArtifactType("ApprovedReviewRecord", item as unknown as Record<string, unknown>),
    }));

  const audit = getReviewAuditLog().map((item) => ({
    artifactType: "ReviewAuditRecord",
    privacy: classifyArtifact("ReviewAuditRecord", item as unknown as Record<string, unknown>),
    retention: evaluateRetentionClass("compliance", item.createdAt),
    deletion: getDeletionPolicy("ReviewAuditRecord"),
    roles: getPrivacyRoleAssignment("ReviewAuditRecord"),
    preview: sanitizeByArtifactType("ReviewAuditRecord", item as unknown as Record<string, unknown>),
  }));

  const refusals = getPermanentRefusals().map((item) => ({
    artifactType: "PermanentRefusalRecord",
    privacy: classifyArtifact("PermanentRefusalRecord", item as unknown as Record<string, unknown>),
    retention: evaluateRetentionClass("dispute", item.refusedAt),
    deletion: getDeletionPolicy("PermanentRefusalRecord"),
    roles: getPrivacyRoleAssignment("PermanentRefusalRecord"),
    preview: sanitizeByArtifactType("PermanentRefusalRecord", item as unknown as Record<string, unknown>),
  }));

  return {
    subjectId,
    generatedAt: new Date().toISOString(),
    summary: {
      reviewQueueCount: queue.length,
      approvedReviewCount: approved.length,
      auditCount: audit.length,
      permanentRefusalCount: refusals.length,
    },
    artifacts: {
      reviewQueue: queue,
      approvedReviews: approved,
      reviewAudit: audit,
      permanentRefusals: refusals,
    },
  };
}
