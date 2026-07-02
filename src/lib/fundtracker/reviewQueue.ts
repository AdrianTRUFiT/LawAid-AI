import type { VerificationDecision, TransactionIntent, ProcessorEvent } from "./types";
import {
  getPersistedReviewGovernanceState,
  savePersistedReviewQueue,
} from "./reviewPersistence";

export type ReviewQueueStatus = "pending_review" | "approved" | "rejected";

export interface ReviewQueueItem {
  reviewId: string;
  transactionId: string;
  verifiedOpportunityId: string;
  merchantId: string;
  customerId: string;
  status: ReviewQueueStatus;
  reasonSummary: string;
  reasons: VerificationDecision["reasons"];
  createdAt: string;
  updatedAt: string;
  source: "held" | "refused";
  context: {
    intent: TransactionIntent;
    processorEvent: ProcessorEvent;
  };
}

const persisted = getPersistedReviewGovernanceState();
const queue: ReviewQueueItem[] = [...persisted.reviewQueue];

function nowIso(): string {
  return new Date().toISOString();
}

function buildReviewId(transactionId: string): string {
  return `review_${transactionId}`;
}

function sync(): void {
  savePersistedReviewQueue(queue);
}

export function getReviewQueue(): ReviewQueueItem[] {
  return [...queue];
}

export function resetReviewQueue(): void {
  queue.length = 0;
  sync();
}

export function addToReviewQueue(
  intent: TransactionIntent,
  processorEvent: ProcessorEvent,
  decision: VerificationDecision,
): ReviewQueueItem {
  const existing = queue.find((item) => item.transactionId === intent.transactionId);
  if (existing) {
    return existing;
  }

  const item: ReviewQueueItem = {
    reviewId: buildReviewId(intent.transactionId),
    transactionId: intent.transactionId,
    verifiedOpportunityId: intent.verifiedOpportunity.verifiedOpportunityId,
    merchantId: intent.verifiedOpportunity.merchantId,
    customerId: intent.verifiedOpportunity.customerId,
    status: "pending_review",
    reasonSummary: decision.reasons.map((r) => r.message).join(" | "),
    reasons: decision.reasons,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    source: decision.verificationStatus === "refused" ? "refused" : "held",
    context: {
      intent,
      processorEvent,
    },
  };

  queue.push(item);
  sync();
  return item;
}

export function getReviewQueueItem(reviewId: string): ReviewQueueItem | null {
  return queue.find((item) => item.reviewId === reviewId) ?? null;
}

export function updateReviewQueueStatus(
  reviewId: string,
  status: ReviewQueueStatus,
): ReviewQueueItem | null {
  const item = queue.find((entry) => entry.reviewId === reviewId);
  if (!item) {
    return null;
  }

  item.status = status;
  item.updatedAt = nowIso();
  sync();
  return item;
}
