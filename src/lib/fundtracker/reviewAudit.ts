import type { ActivatedTransactionState, VerificationDecision } from "./types";
import {
  getPersistedReviewGovernanceState,
  savePersistedPermanentRefusals,
  savePersistedReviewAuditLog,
} from "./reviewPersistence";

export type ReviewAction = "approved" | "rejected";

export interface ReviewAuditRecord {
  auditId: string;
  reviewId: string;
  transactionId: string;
  action: ReviewAction;
  reviewerId: string;
  reviewerNote: string;
  createdAt: string;
}

export interface ReviewOutcome {
  action: ReviewAction;
  audit: ReviewAuditRecord;
  activatedTransactionState?: ActivatedTransactionState;
  permanentRefusalRecord?: {
    transactionId: string;
    reviewId: string;
    reviewerId: string;
    reviewerNote: string;
    reasons: VerificationDecision["reasons"];
    refusedAt: string;
  };
}

const persisted = getPersistedReviewGovernanceState();
const auditLog: ReviewAuditRecord[] = [...persisted.reviewAuditLog];
const permanentRefusals: NonNullable<ReviewOutcome["permanentRefusalRecord"]>[] = [
  ...persisted.permanentRefusals,
];

function nowIso(): string {
  return new Date().toISOString();
}

function buildAuditId(reviewId: string): string {
  return `audit_${reviewId}_${Date.now()}`;
}

function syncAudit(): void {
  savePersistedReviewAuditLog(auditLog);
}

function syncRefusals(): void {
  savePersistedPermanentRefusals(permanentRefusals);
}

export function getReviewAuditLog(): ReviewAuditRecord[] {
  return [...auditLog];
}

export function getPermanentRefusals() {
  return [...permanentRefusals];
}

export function resetReviewAuditLog(): void {
  auditLog.length = 0;
  permanentRefusals.length = 0;
  syncAudit();
  syncRefusals();
}

export function createReviewAuditRecord(
  reviewId: string,
  transactionId: string,
  action: ReviewAction,
  reviewerId: string,
  reviewerNote: string,
): ReviewAuditRecord {
  const record: ReviewAuditRecord = {
    auditId: buildAuditId(reviewId),
    reviewId,
    transactionId,
    action,
    reviewerId,
    reviewerNote,
    createdAt: nowIso(),
  };

  auditLog.push(record);
  syncAudit();
  return record;
}

export function recordPermanentRefusal(
  reviewId: string,
  transactionId: string,
  reviewerId: string,
  reviewerNote: string,
  reasons: VerificationDecision["reasons"],
) {
  const refusal = {
    transactionId,
    reviewId,
    reviewerId,
    reviewerNote,
    reasons,
    refusedAt: nowIso(),
  };

  permanentRefusals.push(refusal);
  syncRefusals();
  return refusal;
}
