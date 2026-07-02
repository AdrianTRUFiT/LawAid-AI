import { getFundTrackerArtifacts } from "./artifactStore";
import { getApprovedReviewRecords } from "./approvedReviewStore";
import { getPermanentRefusals, getReviewAuditLog } from "./reviewAudit";
import { getReviewEventHistory } from "./reviewEventHistory";
import { getReviewQueue } from "./reviewQueue";

export interface TimelineEntry {
  timestamp: string;
  type:
    | "transaction_activated"
    | "review_queue"
    | "review_audit"
    | "review_event"
    | "approved_review"
    | "permanent_refusal";
  transactionId: string;
  merchantId?: string;
  reviewerId?: string;
  status?: string;
  summary: string;
  payload: Record<string, unknown>;
}

function pushIfTimestamp(entries: TimelineEntry[], entry: TimelineEntry): void {
  if (entry.timestamp) {
    entries.push(entry);
  }
}

export function buildTransactionTimeline(transactionId: string): TimelineEntry[] {
  const entries: TimelineEntry[] = [];

  const artifacts = getFundTrackerArtifacts();
  const activated = artifacts.activatedTransactionStates.find(
    (item) => item.transactionId === transactionId,
  );

  if (activated) {
    pushIfTimestamp(entries, {
      timestamp: activated.updatedAt,
      type: "transaction_activated",
      transactionId,
      merchantId: activated.merchantId,
      status: activated.verificationStatus,
      summary: "Activated transaction state recorded.",
      payload: {
        grossAmount: activated.grossAmount,
        currency: activated.currency,
        destination: activated.destination,
      },
    });
  }

  const queueItem = getReviewQueue().find((item) => item.transactionId === transactionId);
  if (queueItem) {
    pushIfTimestamp(entries, {
      timestamp: queueItem.updatedAt || queueItem.createdAt,
      type: "review_queue",
      transactionId,
      merchantId: queueItem.merchantId,
      status: queueItem.status,
      summary: "Review queue item recorded.",
      payload: {
        reviewId: queueItem.reviewId,
        source: queueItem.source,
        reasonSummary: queueItem.reasonSummary,
      },
    });
  }

  for (const audit of getReviewAuditLog().filter((item) => item.transactionId === transactionId)) {
    pushIfTimestamp(entries, {
      timestamp: audit.createdAt,
      type: "review_audit",
      transactionId,
      reviewerId: audit.reviewerId,
      status: audit.action,
      summary: `Review audit recorded: ${audit.action}.`,
      payload: {
        reviewId: audit.reviewId,
        reviewerNote: audit.reviewerNote,
      },
    });
  }

  for (const event of getReviewEventHistory().filter((item) => item.transactionId === transactionId)) {
    pushIfTimestamp(entries, {
      timestamp: event.createdAt,
      type: "review_event",
      transactionId,
      reviewerId: event.reviewerId,
      status: event.eventType,
      summary: `Review event recorded: ${event.eventType}.`,
      payload: {
        reviewId: event.reviewId,
        payload: event.payload,
        reviewerNote: event.reviewerNote ?? null,
      },
    });
  }

  for (const approved of getApprovedReviewRecords().filter((item) => item.transactionId === transactionId)) {
    pushIfTimestamp(entries, {
      timestamp: approved.approvedAt,
      type: "approved_review",
      transactionId,
      reviewerId: approved.reviewerId,
      status: "approved",
      summary: "Approved review record stored.",
      payload: {
        reviewId: approved.reviewId,
        reviewerNote: approved.reviewerNote,
      },
    });
  }

  for (const refusal of getPermanentRefusals().filter((item) => item.transactionId === transactionId)) {
    pushIfTimestamp(entries, {
      timestamp: refusal.refusedAt,
      type: "permanent_refusal",
      transactionId,
      reviewerId: refusal.reviewerId,
      status: "rejected",
      summary: "Permanent refusal record stored.",
      payload: {
        reviewId: refusal.reviewId,
        reviewerNote: refusal.reviewerNote,
        reasonCount: refusal.reasons.length,
      },
    });
  }

  return entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function buildMerchantTimeline(merchantId: string): TimelineEntry[] {
  const transactionIds = new Set<string>();

  for (const tx of getFundTrackerArtifacts().activatedTransactionStates) {
    if (tx.merchantId === merchantId) {
      transactionIds.add(tx.transactionId);
    }
  }

  for (const item of getReviewQueue()) {
    if (item.merchantId === merchantId) {
      transactionIds.add(item.transactionId);
    }
  }

  const entries = Array.from(transactionIds).flatMap((transactionId) =>
    buildTransactionTimeline(transactionId),
  );

  return entries.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}
