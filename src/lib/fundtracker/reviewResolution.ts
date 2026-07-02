import {
  buildActivatedTransactionState,
} from "./verificationEngine";
import {
  getReviewQueueItem,
  updateReviewQueueStatus,
} from "./reviewQueue";
import {
  canReviewerApprove,
  canReviewerReject,
} from "./reviewerPolicy";
import {
  createReviewAuditRecord,
  recordPermanentRefusal,
  type ReviewOutcome,
} from "./reviewAudit";
import {
  appendReviewEvent,
} from "./reviewEventHistory";
import {
  appendApprovedReviewRecord,
} from "./approvedReviewStore";
import {
  recordActivatedTransactionArtifact,
  recordVerificationDecisionArtifact,
} from "./artifactStore";

export function approveReviewQueueItem(
  reviewId: string,
  reviewerId: string,
  reviewerNote: string,
): ReviewOutcome | null {
  const item = getReviewQueueItem(reviewId);
  if (!item) {
    return null;
  }

  if (!canReviewerApprove(reviewerId)) {
    throw new Error(`Reviewer ${reviewerId} is not authorized to approve review items.`);
  }

  updateReviewQueueStatus(reviewId, "approved");

  appendReviewEvent(
    reviewId,
    item.transactionId,
    "review_status_updated",
    { status: "approved" },
    reviewerId,
    reviewerNote,
  );

  const approvalDecision = {
    allowed: true,
    paymentStatus: "verified" as const,
    verificationStatus: "verified" as const,
    reasons: [],
    evaluatedAt: new Date().toISOString(),
  };

  recordVerificationDecisionArtifact(approvalDecision);

  const activatedTransactionState = buildActivatedTransactionState(
    item.context.intent,
    item.context.processorEvent,
    approvalDecision,
  );

  recordActivatedTransactionArtifact(activatedTransactionState);

  appendApprovedReviewRecord({
    reviewId,
    transactionId: item.transactionId,
    reviewerId,
    reviewerNote,
    approvedAt: new Date().toISOString(),
    activatedTransactionState,
  });

  appendReviewEvent(
    reviewId,
    item.transactionId,
    "review_approved",
    { status: "approved" },
    reviewerId,
    reviewerNote,
  );

  appendReviewEvent(
    reviewId,
    item.transactionId,
    "activated_from_review",
    {
      destination: activatedTransactionState.destination,
      grossAmount: activatedTransactionState.grossAmount,
      currency: activatedTransactionState.currency,
    },
    reviewerId,
    reviewerNote,
  );

  const audit = createReviewAuditRecord(
    reviewId,
    item.transactionId,
    "approved",
    reviewerId,
    reviewerNote,
  );

  return {
    action: "approved",
    audit,
    activatedTransactionState,
  };
}

export function rejectReviewQueueItem(
  reviewId: string,
  reviewerId: string,
  reviewerNote: string,
): ReviewOutcome | null {
  const item = getReviewQueueItem(reviewId);
  if (!item) {
    return null;
  }

  if (!canReviewerReject(reviewerId)) {
    throw new Error(`Reviewer ${reviewerId} is not authorized to reject review items.`);
  }

  updateReviewQueueStatus(reviewId, "rejected");

  appendReviewEvent(
    reviewId,
    item.transactionId,
    "review_status_updated",
    { status: "rejected" },
    reviewerId,
    reviewerNote,
  );

  const rejectionDecision = {
    allowed: false,
    paymentStatus: "refused" as const,
    verificationStatus: "refused" as const,
    reasons: item.reasons,
    evaluatedAt: new Date().toISOString(),
  };

  recordVerificationDecisionArtifact(rejectionDecision);

  const permanentRefusalRecord = recordPermanentRefusal(
    reviewId,
    item.transactionId,
    reviewerId,
    reviewerNote,
    item.reasons,
  );

  appendReviewEvent(
    reviewId,
    item.transactionId,
    "review_rejected",
    { status: "rejected" },
    reviewerId,
    reviewerNote,
  );

  appendReviewEvent(
    reviewId,
    item.transactionId,
    "permanent_refusal_recorded",
    {
      reasonCount: item.reasons.length,
    },
    reviewerId,
    reviewerNote,
  );

  const audit = createReviewAuditRecord(
    reviewId,
    item.transactionId,
    "rejected",
    reviewerId,
    reviewerNote,
  );

  return {
    action: "rejected",
    audit,
    permanentRefusalRecord,
  };
}
