import type { InvoiceRecord, PaymentRecord } from '../../types/financial';
import type {
  PaymentAuthorizationRecord,
  PaymentAuthorizationRule,
  PaymentIntentPacket,
  PaymentSource,
  PreProcessorGovernanceState,
  PreProcessorReviewRecord,
  ScheduledTransaction,
  TransactionAnomalyFlag,
  TransactionProcessingRecord,
  MatterTransaction,
} from '../../types/preProcessorPayments';
import {
  buildAuthorizationHash,
  computePlatformFee,
  defaultExpiryTimestamp,
  recommendedScheduledDate,
  resolveAuthorizationMode,
  runAuthorizationLayer,
  runDecisionLayer,
  runPostProcessorReconciliation,
  runPreProcessorReconciliation,
  runValidationLayer,
} from './preProcessorGovernanceEngine';

const STORAGE_PREFIX = 'lawaidai-preprocessor-governance';

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function storageKey(workspaceId: string) {
  return `${STORAGE_PREFIX}:${workspaceId}`;
}

function safeState(state: PreProcessorGovernanceState): PreProcessorGovernanceState {
  return {
    workspaceId: state.workspaceId,
    paymentIntents: state.paymentIntents ?? [],
    authorizations: state.authorizations ?? [],
    transactions: state.transactions ?? [],
    paymentSources: state.paymentSources ?? [],
    authorizationRules: state.authorizationRules ?? [],
    scheduledTransactions: state.scheduledTransactions ?? [],
    processingRecords: state.processingRecords ?? [],
    preProcessorReviews: state.preProcessorReviews ?? [],
    anomalies: state.anomalies ?? [],
    updatedAt: state.updatedAt ?? nowIso(),
  };
}

export function createEmptyPreProcessorGovernanceState(
  workspaceId: string
): PreProcessorGovernanceState {
  return {
    workspaceId,
    paymentIntents: [],
    authorizations: [],
    transactions: [],
    paymentSources: [],
    authorizationRules: [],
    scheduledTransactions: [],
    processingRecords: [],
    preProcessorReviews: [],
    anomalies: [],
    updatedAt: nowIso(),
  };
}

export function loadPreProcessorGovernanceState(
  workspaceId: string
): PreProcessorGovernanceState {
  if (typeof window === 'undefined') {
    return createEmptyPreProcessorGovernanceState(workspaceId);
  }

  const raw = window.localStorage.getItem(storageKey(workspaceId));
  if (!raw) return createEmptyPreProcessorGovernanceState(workspaceId);

  try {
    const parsed = JSON.parse(raw) as PreProcessorGovernanceState;
    return safeState({
      ...createEmptyPreProcessorGovernanceState(workspaceId),
      ...parsed,
      workspaceId,
    });
  } catch {
    return createEmptyPreProcessorGovernanceState(workspaceId);
  }
}

export function savePreProcessorGovernanceState(
  state: PreProcessorGovernanceState
) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    storageKey(state.workspaceId),
    JSON.stringify({ ...safeState(state), updatedAt: nowIso() })
  );
}

export function addPaymentSource(
  state: PreProcessorGovernanceState,
  input: {
    matterId: string;
    sourceType: PaymentSource['sourceType'];
    label: string;
    last4?: string;
    cardBrand?: string;
    billingName?: string;
    isDefault?: boolean;
    isPreapproved?: boolean;
  }
): PreProcessorGovernanceState {
  const current = safeState(state);

  const existing = current.paymentSources.find(
    (item) =>
      item.matterId === input.matterId &&
      item.label.trim().toLowerCase() === input.label.trim().toLowerCase()
  );

  if (existing) return current;

  const source: PaymentSource = {
    id: makeId('psrc'),
    workspaceId: current.workspaceId,
    matterId: input.matterId,
    sourceType: input.sourceType,
    label: input.label,
    last4: input.last4,
    cardBrand: input.cardBrand,
    billingName: input.billingName,
    isDefault: Boolean(input.isDefault || current.paymentSources.length === 0),
    isPreapproved: Boolean(input.isPreapproved),
    spendingRules: '',
    active: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const next: PreProcessorGovernanceState = {
    ...current,
    paymentSources: source.isDefault
      ? [source, ...current.paymentSources.map((item) => ({ ...item, isDefault: false }))]
      : [source, ...current.paymentSources],
    updatedAt: nowIso(),
  };

  savePreProcessorGovernanceState(next);
  return next;
}

export function addAuthorizationRule(
  state: PreProcessorGovernanceState,
  input: {
    matterId: string;
    paymentSourceId?: string;
    approvalMode: PaymentAuthorizationRule['approvalMode'];
    maxSingleTransaction?: number;
    maxMonthlyProcessing?: number;
    allowedCategories: string[];
    requiresManualReviewAbove?: number;
    autoPayEnabled: boolean;
  }
): PreProcessorGovernanceState {
  const current = safeState(state);

  const existing = current.authorizationRules.find(
    (item) =>
      item.matterId === input.matterId &&
      item.paymentSourceId === input.paymentSourceId &&
      item.approvalMode === input.approvalMode &&
      JSON.stringify(item.allowedCategories) === JSON.stringify(input.allowedCategories)
  );

  if (existing) return current;

  const rule: PaymentAuthorizationRule = {
    id: makeId('rule'),
    workspaceId: current.workspaceId,
    matterId: input.matterId,
    paymentSourceId: input.paymentSourceId,
    approvalMode: input.approvalMode,
    maxSingleTransaction: input.maxSingleTransaction,
    maxMonthlyProcessing: input.maxMonthlyProcessing,
    allowedCategories: input.allowedCategories,
    requiresManualReviewAbove: input.requiresManualReviewAbove,
    autoPayEnabled: input.autoPayEnabled,
    active: true,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const next: PreProcessorGovernanceState = {
    ...current,
    authorizationRules: [rule, ...current.authorizationRules],
    updatedAt: nowIso(),
  };

  savePreProcessorGovernanceState(next);
  return next;
}

export function createPaymentIntent(
  state: PreProcessorGovernanceState,
  input: {
    matterId: string;
    payerId: string;
    payeeId: string;
    obligationId?: string;
    invoiceId?: string;
    amount: number;
    currency: string;
    reasonCode: string;
    dueDate?: string;
    approvalMode: PaymentIntentPacket['approvalMode'];
    supportingRefs?: string[];
  }
): { state: PreProcessorGovernanceState; intent: PaymentIntentPacket } {
  const current = safeState(state);

  const existingIntent = current.paymentIntents.find(
    (item) => item.invoiceId && item.invoiceId === input.invoiceId
  );
  const existingTransaction = current.transactions.find(
    (item) => item.linkedInvoiceId && item.linkedInvoiceId === input.invoiceId
  );

  if (existingIntent && existingTransaction) {
    return { state: current, intent: existingIntent };
  }

  const intent: PaymentIntentPacket = {
    id: makeId('pip'),
    workspaceId: current.workspaceId,
    matterId: input.matterId,
    payerId: input.payerId,
    payeeId: input.payeeId,
    obligationId: input.obligationId,
    invoiceId: input.invoiceId,
    amount: input.amount,
    currency: input.currency,
    reasonCode: input.reasonCode,
    dueDate: input.dueDate,
    approvalMode: input.approvalMode,
    supportingRefs: input.supportingRefs || [],
    validationStatus: 'pending',
    decisionStatus: 'needs_review',
    decisionReasons: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const fee = computePlatformFee(input.amount);

  const transaction: MatterTransaction = {
    id: makeId('txn'),
    workspaceId: current.workspaceId,
    matterId: input.matterId,
    title: `Payment for ${input.payeeId}`,
    description: `Pre-processor tracked transaction for ${input.payeeId}`,
    transactionType: 'legal_invoice',
    category: input.reasonCode,
    counterpartyId: input.payeeId,
    counterpartyName: input.payeeId,
    linkedObligationId: input.obligationId,
    linkedInvoiceId: input.invoiceId,
    amountExpected: input.amount,
    platformFee: fee,
    totalToProcess: Number((input.amount + fee).toFixed(2)),
    dueDate: input.dueDate,
    status: 'identified',
    reviewRequired: false,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const next: PreProcessorGovernanceState = {
    ...current,
    paymentIntents: [intent, ...current.paymentIntents],
    transactions: [transaction, ...current.transactions],
    updatedAt: nowIso(),
  };

  savePreProcessorGovernanceState(next);
  return { state: next, intent };
}

export function validatePaymentIntent(
  state: PreProcessorGovernanceState,
  input: {
    paymentIntentId: string;
    invoice: InvoiceRecord;
    payments?: PaymentRecord[];
  }
): PreProcessorGovernanceState {
  const current = safeState(state);
  const intent = current.paymentIntents.find((item) => item.id === input.paymentIntentId);
  if (!intent) return current;

  const paidAmount = (input.payments || [])
    .filter((payment) => payment.invoiceId === input.invoice.id && payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const balance = Math.max(0, input.invoice.total - paidAmount);
  const source =
    current.paymentSources.find((item) => item.isDefault && item.active) ||
    current.paymentSources.find((item) => item.active) ||
    null;

  const duplicate = current.processingRecords.some(
    (item) =>
      item.amountPaid === balance &&
      item.status === 'confirmed' &&
      current.transactions.find((tx) => tx.id === item.transactionId)?.linkedInvoiceId !== input.invoice.id
  );

  const decision = runDecisionLayer({
    invoice: input.invoice,
    balance,
    hasSource: Boolean(source),
    existingDuplicate: duplicate,
    isDisputed: input.invoice.status === 'disputed',
    budgetBlocked: false,
  });

  const validation = runValidationLayer({
    invoice: input.invoice,
    balance,
    paymentSource: source,
  });

  const existingReview = current.preProcessorReviews.find(
    (item) => item.paymentIntentId === intent.id
  );

  const review: PreProcessorReviewRecord = {
    id: existingReview?.id || makeId('review'),
    workspaceId: current.workspaceId,
    matterId: intent.matterId,
    paymentIntentId: intent.id,
    invoiceId: input.invoice.id,
    decisionStatus: decision.status,
    validationStatus: validation.status,
    authorizationStatus: existingReview?.authorizationStatus || 'not_attempted',
    preReconciliationStatus: existingReview?.preReconciliationStatus || 'pending',
    refusalReasons: [
      ...decision.reasons.filter((r) => decision.status === 'denied'),
      ...validation.reasons.filter((r) => validation.status === 'invalid'),
    ],
    reviewReasons: [
      ...decision.reasons.filter((r) => decision.status === 'needs_review'),
      ...validation.reasons.filter((r) => validation.status === 'needs_review'),
    ],
    createdAt: existingReview?.createdAt || nowIso(),
    updatedAt: nowIso(),
  };

  const nextAnomalies = [...current.anomalies];
  if (
    validation.reasons.includes('Supporting proof not present.') &&
    !nextAnomalies.some(
      (item) =>
        item.invoiceId === input.invoice.id &&
        item.type === 'missing_support' &&
        item.status === 'open'
    )
  ) {
    nextAnomalies.unshift({
      id: makeId('anomaly'),
      workspaceId: current.workspaceId,
      matterId: intent.matterId,
      invoiceId: input.invoice.id,
      severity: 'medium',
      type: 'missing_support',
      explanation: 'Supporting proof not present.',
      status: 'open',
      createdAt: nowIso(),
    } as TransactionAnomalyFlag);
  }

  const next: PreProcessorGovernanceState = {
    ...current,
    paymentIntents: current.paymentIntents.map((item) =>
      item.id === intent.id
        ? {
            ...item,
            decisionStatus: decision.status,
            validationStatus: validation.status,
            decisionReasons: [...decision.reasons, ...validation.reasons],
            updatedAt: nowIso(),
          }
        : item
    ),
    preProcessorReviews: [
      review,
      ...current.preProcessorReviews.filter((item) => item.paymentIntentId !== intent.id),
    ],
    anomalies: nextAnomalies,
    updatedAt: nowIso(),
  };

  savePreProcessorGovernanceState(next);
  return next;
}

export function authorizePaymentIntent(
  state: PreProcessorGovernanceState,
  input: {
    paymentIntentId: string;
    invoice: InvoiceRecord;
    userId: string;
  }
): PreProcessorGovernanceState {
  const current = safeState(state);
  const intent = current.paymentIntents.find((item) => item.id === input.paymentIntentId);
  if (!intent) return current;

  const existingTransaction = current.transactions.find(
    (item) => item.linkedInvoiceId === input.invoice.id
  );
  if (existingTransaction?.linkedAuthorizationId) return current;

  const source =
    current.paymentSources.find((item) => item.isDefault && item.active) ||
    current.paymentSources.find((item) => item.active) ||
    null;

  const rule =
    current.authorizationRules.find(
      (item) => item.active && (!item.paymentSourceId || item.paymentSourceId === source?.id)
    ) || null;

  const category = input.invoice.lineItems?.[0]?.category || 'legal_fee';

  const authResult = runAuthorizationLayer({
    balance: intent.amount,
    category,
    paymentSource: source,
    rule,
    explicitApproval: true,
  });

  const existingReview = current.preProcessorReviews.find(
    (item) => item.paymentIntentId === intent.id
  );

  const nextReviews = current.preProcessorReviews.map((item) =>
    item.paymentIntentId === intent.id
      ? {
          ...item,
          authorizationStatus: authResult.status,
          refusalReasons:
            authResult.status === 'denied'
              ? [...item.refusalReasons, ...authResult.reasons]
              : item.refusalReasons,
          reviewReasons:
            authResult.status === 'manual_review_required'
              ? [...item.reviewReasons, ...authResult.reasons]
              : item.reviewReasons,
          updatedAt: nowIso(),
        }
      : item
  );

  if (authResult.status !== 'authorized' || !source || !existingTransaction) {
    const next = { ...current, preProcessorReviews: nextReviews, updatedAt: nowIso() };
    savePreProcessorGovernanceState(next);
    return next;
  }

  const authorization: PaymentAuthorizationRecord = {
    id: makeId('par'),
    paymentIntentId: intent.id,
    workspaceId: current.workspaceId,
    matterId: intent.matterId,
    paymentSourceId: source.id,
    authorizedBy: input.userId,
    authorizationMode: resolveAuthorizationMode(category, intent.amount, rule),
    authorizedAmount: intent.amount,
    allowedPayeeId: intent.payeeId,
    expiresAt: defaultExpiryTimestamp(),
    status: 'authorized',
    ruleSnapshot: [...(rule ? [rule.id] : []), ...authResult.reasons],
    signatureOrHash: buildAuthorizationHash([
      intent.id,
      intent.payeeId,
      String(intent.amount),
      source.id,
      nowIso(),
    ]),
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const preRec = runPreProcessorReconciliation({
    invoice: input.invoice,
    balance: intent.amount,
    payeeId: intent.payeeId,
    paymentSourceId: source.id,
    authorizedAmount: authorization.authorizedAmount,
  });

  const next: PreProcessorGovernanceState = {
    ...current,
    authorizations: [authorization, ...current.authorizations],
    transactions: current.transactions.map((item) =>
      item.id === existingTransaction.id
        ? {
            ...item,
            linkedAuthorizationId: authorization.id,
            amountApproved: authorization.authorizedAmount,
            paymentSourceId: source.id,
            status: 'authorized',
            reviewRequired: (existingReview?.reviewReasons?.length || 0) > 0,
            updatedAt: nowIso(),
          }
        : item
    ),
    preProcessorReviews: nextReviews.map((item) =>
      item.paymentIntentId === intent.id
        ? {
            ...item,
            authorizationStatus: 'authorized',
            preReconciliationStatus: preRec.status,
            refusalReasons:
              preRec.status === 'mismatch'
                ? [...item.refusalReasons, ...preRec.reasons]
                : item.refusalReasons,
            reviewReasons:
              preRec.status === 'needs_review'
                ? [...item.reviewReasons, ...preRec.reasons]
                : item.reviewReasons,
            updatedAt: nowIso(),
          }
        : item
    ),
    updatedAt: nowIso(),
  };

  savePreProcessorGovernanceState(next);
  return next;
}

export function queueScheduledTransaction(
  state: PreProcessorGovernanceState,
  transactionId: string
): PreProcessorGovernanceState {
  const current = safeState(state);
  const transaction = current.transactions.find((item) => item.id === transactionId);
  if (!transaction || !transaction.linkedAuthorizationId || !transaction.paymentSourceId) {
    return current;
  }

  const review = current.preProcessorReviews.find(
    (item) => item.invoiceId === transaction.linkedInvoiceId
  );
  if ((review?.reviewReasons?.length || 0) > 0) return current;

  const existingScheduled = current.scheduledTransactions.find(
    (item) => item.transactionId === transaction.id && item.status !== 'canceled'
  );
  if (existingScheduled) return current;

  const scheduled: ScheduledTransaction = {
    id: makeId('sched'),
    workspaceId: current.workspaceId,
    matterId: transaction.matterId,
    transactionId: transaction.id,
    authorizationId: transaction.linkedAuthorizationId,
    scheduledFor: recommendedScheduledDate(transaction.dueDate),
    amount: transaction.amountApproved || transaction.amountExpected,
    platformFee: transaction.platformFee,
    totalCharge: transaction.totalToProcess,
    counterpartyId: transaction.counterpartyId,
    counterpartyName: transaction.counterpartyName,
    paymentSourceId: transaction.paymentSourceId,
    scheduleReason: 'Queued from pre-processor governance panel.',
    status: 'scheduled',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const next: PreProcessorGovernanceState = {
    ...current,
    scheduledTransactions: [scheduled, ...current.scheduledTransactions],
    transactions: current.transactions.map((item) =>
      item.id === transaction.id
        ? { ...item, scheduledDate: scheduled.scheduledFor, status: 'scheduled', updatedAt: nowIso() }
        : item
    ),
    updatedAt: nowIso(),
  };

  savePreProcessorGovernanceState(next);
  return next;
}

export function submitAuthorizedTransaction(
  state: PreProcessorGovernanceState,
  scheduledTransactionId: string
): PreProcessorGovernanceState {
  const current = safeState(state);
  const scheduled = current.scheduledTransactions.find((item) => item.id === scheduledTransactionId);
  if (!scheduled) return current;

  const existingProcessing = current.processingRecords.find(
    (item) => item.scheduledTransactionId === scheduled.id && item.status !== 'failed'
  );
  if (existingProcessing) return current;

  const processing: TransactionProcessingRecord = {
    id: makeId('proc'),
    workspaceId: current.workspaceId,
    matterId: scheduled.matterId,
    transactionId: scheduled.transactionId,
    authorizationId: scheduled.authorizationId,
    scheduledTransactionId: scheduled.id,
    processorReference: `rail_${Math.random().toString(36).slice(2, 10)}`,
    amountPaid: scheduled.amount,
    platformFeeCharged: scheduled.platformFee,
    totalCharged: scheduled.totalCharge,
    paymentSourceId: scheduled.paymentSourceId,
    status: 'submitted',
    receiptIds: [],
    processorPayloadHash: buildAuthorizationHash([
      scheduled.id,
      scheduled.authorizationId,
      String(scheduled.totalCharge),
    ]),
  };

  const next: PreProcessorGovernanceState = {
    ...current,
    processingRecords: [processing, ...current.processingRecords],
    scheduledTransactions: current.scheduledTransactions.map((item) =>
      item.id === scheduled.id
        ? { ...item, status: 'processing', updatedAt: nowIso() }
        : item
    ),
    transactions: current.transactions.map((item) =>
      item.id === scheduled.transactionId
        ? { ...item, status: 'processing', updatedAt: nowIso() }
        : item
    ),
    updatedAt: nowIso(),
  };

  savePreProcessorGovernanceState(next);
  return next;
}

export function recordProcessorConfirmation(
  state: PreProcessorGovernanceState,
  input: {
    processingRecordId: string;
    amountPaid: number;
    actualPayeeId: string;
    paymentRecordId?: string;
  }
): PreProcessorGovernanceState {
  const current = safeState(state);
  const processing = current.processingRecords.find((item) => item.id === input.processingRecordId);
  if (!processing || processing.status === 'confirmed') return current;

  const authorization = current.authorizations.find((item) => item.id === processing.authorizationId);
  if (!authorization) return current;

  const postRec = runPostProcessorReconciliation({
    authorizedAmount: authorization.authorizedAmount,
    amountPaid: input.amountPaid,
    authorizedPayeeId: authorization.allowedPayeeId,
    actualPayeeId: input.actualPayeeId,
  });

  const anomaly: TransactionAnomalyFlag | null =
    postRec.status === 'mismatch'
      ? {
          id: makeId('anomaly'),
          workspaceId: current.workspaceId,
          matterId: processing.matterId,
          transactionId: processing.transactionId,
          processingRecordId: processing.id,
          invoiceId: current.transactions.find((t) => t.id === processing.transactionId)?.linkedInvoiceId,
          severity: 'high',
          type: 'processor_confirmation_mismatch',
          explanation: postRec.reasons.join(' '),
          status: 'open',
          createdAt: nowIso(),
        }
      : null;

  const next: PreProcessorGovernanceState = {
    ...current,
    processingRecords: current.processingRecords.map((item) =>
      item.id === processing.id
        ? {
            ...item,
            amountPaid: input.amountPaid,
            paidAt: nowIso(),
            status: postRec.status === 'matched' ? 'confirmed' : 'failed',
            notes: postRec.reasons.join(' '),
            receiptIds: input.paymentRecordId ? [...item.receiptIds, input.paymentRecordId] : item.receiptIds,
          }
        : item
    ),
    transactions: current.transactions.map((item) =>
      item.id === processing.transactionId
        ? {
            ...item,
            paidDate: postRec.status === 'matched' ? nowIso().slice(0, 10) : item.paidDate,
            status: postRec.status === 'matched' ? 'paid' : 'failed',
            updatedAt: nowIso(),
          }
        : item
    ),
    anomalies: anomaly ? [anomaly, ...current.anomalies] : current.anomalies,
    updatedAt: nowIso(),
  };

  savePreProcessorGovernanceState(next);
  return next;
}
