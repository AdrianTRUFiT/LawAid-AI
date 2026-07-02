// src/lib/financial/preProcessorGovernanceEngine.ts

import type { InvoiceRecord, PaymentRecord } from '../../types/financial';
import type {
  AuthorizationMode,
  AuthorizationStatus,
  DecisionStatus,
  PaymentAuthorizationRule,
  PaymentSource,
  PreReconciliationStatus,
  ValidationStatus,
} from '../../types/preProcessorPayments';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function computePlatformFee(amount: number) {
  return Number((amount * 0.025).toFixed(2));
}

export function detectDuplicateAttempt(
  invoiceId: string | undefined,
  amount: number,
  vendorName: string,
  existing: Array<{ invoiceId?: string; amountPaid?: number; notes?: string }>
) {
  return existing.some(
    (item) =>
      item.invoiceId === invoiceId &&
      Number(item.amountPaid || 0) === Number(amount) &&
      Boolean(vendorName)
  );
}

export function runDecisionLayer(input: {
  invoice: InvoiceRecord;
  balance: number;
  hasSource: boolean;
  existingDuplicate: boolean;
  isDisputed: boolean;
  budgetBlocked: boolean;
}): { status: DecisionStatus; reasons: string[] } {
  const reasons: string[] = [];

  if (!input.invoice.id) reasons.push('Missing invoice linkage.');
  if (!input.invoice.vendorName) reasons.push('Missing payee / vendor identity.');
  if (input.balance <= 0) reasons.push('No remaining balance to pay.');
  if (input.existingDuplicate) reasons.push('Potential duplicate pattern detected.');
  if (input.isDisputed) reasons.push('Invoice is disputed or blocked.');
  if (input.budgetBlocked) reasons.push('Budget guardrail triggered.');
  if (!input.hasSource) reasons.push('No active payment source available.');

  if (reasons.some((r) => r.includes('Missing')) || input.balance <= 0) {
    return { status: 'denied', reasons };
  }

  if (input.existingDuplicate || input.isDisputed || input.budgetBlocked || !input.hasSource) {
    return { status: 'needs_review', reasons };
  }

  return { status: 'approved_for_validation', reasons: ['Decision layer passed.'] };
}

export function runValidationLayer(input: {
  invoice: InvoiceRecord;
  balance: number;
  paymentSource: PaymentSource | null;
}): { status: ValidationStatus; reasons: string[] } {
  const reasons: string[] = [];
  const lineItemTotal = input.invoice.lineItems.reduce((sum, item) => sum + item.amount, 0);

  if (input.balance <= 0) reasons.push('Balance is zero.');
  if (!input.paymentSource) reasons.push('Missing payment source.');
  if (!input.invoice.currency) reasons.push('Missing currency.');
  if (!input.invoice.vendorName) reasons.push('Missing payee identity.');
  if (!input.invoice.invoiceDate) reasons.push('Missing invoice date.');
  if (!input.invoice.dueDate) reasons.push('Missing due date.');
  if (input.invoice.supportingDocumentIds.length === 0) {
    reasons.push('Supporting proof not present.');
  }
  if (input.invoice.lineItems.length > 0 && lineItemTotal !== input.invoice.total) {
    reasons.push('Invoice total does not equal line-item total.');
  }

  if (reasons.some((r) => r.includes('Missing') || r.includes('zero'))) {
    return { status: 'invalid', reasons };
  }

  if (reasons.length > 0) {
    return { status: 'needs_review', reasons };
  }

  return { status: 'valid', reasons: ['Validation layer passed.'] };
}

export function resolveAuthorizationMode(
  invoiceCategory: string,
  balance: number,
  rule: PaymentAuthorizationRule | null
): AuthorizationMode {
  if (!rule) return 'manual_only';
  if (
    rule.autoPayEnabled &&
    rule.allowedCategories.includes(invoiceCategory) &&
    (!rule.maxSingleTransaction || balance <= rule.maxSingleTransaction)
  ) {
    return 'auto_if_within_rules';
  }
  if (rule.active) return rule.approvalMode;
  return 'manual_only';
}

export function runAuthorizationLayer(input: {
  balance: number;
  vendorName: string;
  category: string;
  paymentSource: PaymentSource | null;
  rule: PaymentAuthorizationRule | null;
  explicitApproval?: boolean;
}): { status: AuthorizationStatus; reasons: string[] } {
  const reasons: string[] = [];

  if (!input.paymentSource || !input.paymentSource.active) {
    return { status: 'denied', reasons: ['No active payment source available.'] };
  }

  if (input.rule) {
    if (
      input.rule.allowedCategories.length > 0 &&
      !input.rule.allowedCategories.includes(input.category)
    ) {
      reasons.push('Category not allowed by current authorization rule.');
      return { status: 'denied', reasons };
    }

    if (
      typeof input.rule.maxSingleTransaction === 'number' &&
      input.balance > input.rule.maxSingleTransaction
    ) {
      reasons.push('Amount exceeds max single transaction threshold.');
      return { status: 'manual_review_required', reasons };
    }

    if (
      typeof input.rule.requiresManualReviewAbove === 'number' &&
      input.balance > input.rule.requiresManualReviewAbove
    ) {
      reasons.push('Amount exceeds manual review threshold.');
      return { status: 'manual_review_required', reasons };
    }

    if (
      input.rule.approvalMode === 'manual_only' &&
      !input.explicitApproval
    ) {
      reasons.push('Manual-only rule requires explicit approval.');
      return { status: 'manual_review_required', reasons };
    }
  }

  return { status: 'authorized', reasons: ['Authorization layer passed.'] };
}

export function runPreProcessorReconciliation(input: {
  invoice: InvoiceRecord;
  balance: number;
  payeeId: string;
  paymentSourceId: string;
  authorizedAmount: number;
}): { status: PreReconciliationStatus; reasons: string[] } {
  const reasons: string[] = [];

  if (input.authorizedAmount !== input.balance) {
    reasons.push('Authorized amount does not match current balance.');
  }
  if (!input.invoice.vendorName || !input.payeeId) {
    reasons.push('Payee identity is incomplete.');
  }
  if (!input.paymentSourceId) {
    reasons.push('Payment source is incomplete.');
  }

  if (reasons.length === 0) {
    return { status: 'matched', reasons: ['Pre-processor reconciliation passed.'] };
  }

  if (reasons.some((r) => r.includes('incomplete'))) {
    return { status: 'needs_review', reasons };
  }

  return { status: 'mismatch', reasons };
}

export function runPostProcessorReconciliation(input: {
  authorizedAmount: number;
  amountPaid: number;
  authorizedPayeeId: string;
  actualPayeeId: string;
}): { status: PreReconciliationStatus; reasons: string[] } {
  const reasons: string[] = [];

  if (Number(input.authorizedAmount) !== Number(input.amountPaid)) {
    reasons.push('Processor amount does not match authorized amount.');
  }

  if (input.authorizedPayeeId !== input.actualPayeeId) {
    reasons.push('Processor payee does not match authorized payee.');
  }

  if (reasons.length === 0) {
    return { status: 'matched', reasons: ['Post-processor reconciliation passed.'] };
  }

  return { status: 'mismatch', reasons };
}

export function defaultExpiryTimestamp(minutes = 15) {
  const now = new Date();
  now.setMinutes(now.getMinutes() + minutes);
  return now.toISOString();
}

export function buildAuthorizationHash(parts: string[]) {
  return btoa(parts.join('|')).slice(0, 64);
}

export function recommendedScheduledDate(dueDate?: string) {
  return dueDate || todayIso();
}