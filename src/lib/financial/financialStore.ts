// src/lib/financial/financialStore.ts

import type {
  CostEstimate,
  FinancialWorkspaceState,
  InvoiceLineItem,
  InvoiceRecord,
  ObligationStatus,
  PaymentObligation,
  PaymentRecord,
  ReceiptRecord,
  ReconciliationMatch,
  ReviewFlag,
  ReviewFlagSeverity,
  ReviewFlagType,
  WorkspaceBudget,
} from '../../types/financial';

const STORAGE_PREFIX = 'lawaidai-financial-workspace';

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function nowIso() {
  return new Date().toISOString();
}

function storageKey(workspaceId: string) {
  return `${STORAGE_PREFIX}:${workspaceId}`;
}

export function createEmptyFinancialWorkspace(workspaceId: string): FinancialWorkspaceState {
  return {
    workspaceId,
    invoices: [],
    obligations: [],
    payments: [],
    receipts: [],
    matches: [],
    flags: [],
    counterparties: [],
    budget: null,
    estimate: null,
    updatedAt: nowIso(),
  };
}

export function loadFinancialWorkspace(workspaceId: string): FinancialWorkspaceState {
  if (typeof window === 'undefined') {
    return createEmptyFinancialWorkspace(workspaceId);
  }

  const raw = window.localStorage.getItem(storageKey(workspaceId));
  if (!raw) return createEmptyFinancialWorkspace(workspaceId);

  try {
    const parsed = JSON.parse(raw) as FinancialWorkspaceState;
    return {
      ...createEmptyFinancialWorkspace(workspaceId),
      ...parsed,
      workspaceId,
    };
  } catch {
    return createEmptyFinancialWorkspace(workspaceId);
  }
}

export function saveFinancialWorkspace(state: FinancialWorkspaceState) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(
    storageKey(state.workspaceId),
    JSON.stringify({
      ...state,
      updatedAt: nowIso(),
    })
  );
}

function buildFlag(
  workspaceId: string,
  targetType: ReviewFlag['targetType'],
  targetId: string,
  flagType: ReviewFlagType,
  severity: ReviewFlagSeverity,
  explanation: string
): ReviewFlag {
  return {
    id: makeId('flag'),
    workspaceId,
    targetType,
    targetId,
    flagType,
    severity,
    explanation,
    status: 'open',
    createdAt: nowIso(),
  };
}

function inferInvoiceFlags(workspaceId: string, invoice: InvoiceRecord): ReviewFlag[] {
  const flags: ReviewFlag[] = [];

  if (invoice.lineItems.length === 0) {
    flags.push(
      buildFlag(
        workspaceId,
        'invoice',
        invoice.id,
        'missing_support',
        'high',
        'Invoice was added without any line items. Add manual detail or supporting records for review.'
      )
    );
  }

  const vagueTerms = ['review', 'attention to matter', 'emails', 'conference', 'work performed', 'analysis'];
  invoice.lineItems.forEach((line) => {
    const lower = line.description.toLowerCase();
    if (vagueTerms.some((term) => lower.includes(term)) && lower.length < 30) {
      flags.push(
        buildFlag(
          workspaceId,
          'invoice_line_item',
          line.id,
          'vague_entry',
          'medium',
          `Line item "${line.description}" may be too vague for clear client-side review.`
        )
      );
    }

    if ((line.billedRole || '').toLowerCase().includes('partner') && line.amount < 150) {
      flags.push(
        buildFlag(
          workspaceId,
          'invoice_line_item',
          line.id,
          'role_mismatch',
          'low',
          `Partner-level role is attached to a low-dollar line item. Review whether the task complexity matches the billed role.`
        )
      );
    }
  });

  return flags;
}

export function addInvoiceRecord(
  state: FinancialWorkspaceState,
  input: {
    vendorName: string;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    total: number;
    notes?: string;
    lineDescription?: string;
    lineAmount?: number;
    billedRole?: string;
    category?: string;
  }
): FinancialWorkspaceState {
  const invoiceId = makeId('invoice');
  const lineItems: InvoiceLineItem[] =
    input.lineDescription && input.lineAmount
      ? [
          {
            id: makeId('line'),
            invoiceId,
            description: input.lineDescription,
            amount: input.lineAmount,
            billedRole: input.billedRole,
            category: input.category,
            reviewFlagIds: [],
          },
        ]
      : [];

  const invoice: InvoiceRecord = {
    id: invoiceId,
    workspaceId: state.workspaceId,
    vendorName: input.vendorName,
    invoiceNumber: input.invoiceNumber,
    invoiceDate: input.invoiceDate,
    dueDate: input.dueDate,
    subtotal: input.total,
    tax: 0,
    total: input.total,
    currency: 'USD',
    lineItems,
    supportingDocumentIds: [],
    status: 'under_review',
    reviewFlagIds: [],
    notes: input.notes,
    uploadedAt: nowIso(),
    parsedAt: nowIso(),
  };

  const autoFlags = inferInvoiceFlags(state.workspaceId, invoice);
  const invoiceWithFlags: InvoiceRecord = {
    ...invoice,
    reviewFlagIds: autoFlags
      .filter((flag) => flag.targetType === 'invoice')
      .map((flag) => flag.id),
    lineItems: invoice.lineItems.map((line) => ({
      ...line,
      reviewFlagIds: autoFlags
        .filter((flag) => flag.targetType === 'invoice_line_item' && flag.targetId === line.id)
        .map((flag) => flag.id),
    })),
  };

  const obligation: PaymentObligation = {
    id: makeId('obl'),
    workspaceId: state.workspaceId,
    title: `Invoice ${input.invoiceNumber}`,
    description: input.notes,
    category: input.category || 'legal_fee',
    vendorName: input.vendorName,
    sourceDocumentIds: [],
    dueDate: input.dueDate,
    expectedAmount: input.total,
    approvedAmount: undefined,
    status: 'received',
    priority: 'medium',
    linkedInvoiceId: invoiceId,
    linkedPaymentIds: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const next: FinancialWorkspaceState = {
    ...state,
    invoices: [invoiceWithFlags, ...state.invoices],
    obligations: [obligation, ...state.obligations],
    flags: [...autoFlags, ...state.flags],
    updatedAt: nowIso(),
  };

  saveFinancialWorkspace(next);
  return next;
}

export function addPaymentRecord(
  state: FinancialWorkspaceState,
  input: {
    vendorName: string;
    amount: number;
    datePaid: string;
    paymentMethodSummary: string;
    invoiceId?: string;
    notes?: string;
  }
): FinancialWorkspaceState {
  const payment: PaymentRecord = {
    id: makeId('pay'),
    workspaceId: state.workspaceId,
    invoiceId: input.invoiceId,
    vendorName: input.vendorName,
    amount: input.amount,
    datePaid: input.datePaid,
    paymentMethodSummary: input.paymentMethodSummary,
    status: 'paid',
    receiptDocumentIds: [],
    notes: input.notes,
  };

  const nextInvoices = state.invoices.map((invoice) => {
    if (invoice.id !== input.invoiceId) return invoice;
    const paidTotal = state.payments
      .filter((p) => p.invoiceId === invoice.id)
      .reduce((sum, p) => sum + p.amount, 0) + input.amount;

    if (paidTotal >= invoice.total) {
      return { ...invoice, status: 'paid' as const };
    }

    return { ...invoice, status: 'partially_approved' as const };
  });

  const nextObligations = state.obligations.map((obligation) => {
    if (obligation.linkedInvoiceId !== input.invoiceId) return obligation;

    const paidTotal = state.payments
      .filter((p) => p.invoiceId === obligation.linkedInvoiceId)
      .reduce((sum, p) => sum + p.amount, 0) + input.amount;

    return {
      ...obligation,
      linkedPaymentIds: [...obligation.linkedPaymentIds, payment.id],
      status: (paidTotal >= obligation.expectedAmount ? 'paid' : 'approved') as ObligationStatus,
      updatedAt: nowIso(),
    };
  });

  const next: FinancialWorkspaceState = {
    ...state,
    payments: [payment, ...state.payments],
    invoices: nextInvoices,
    obligations: nextObligations,
    updatedAt: nowIso(),
  };

  saveFinancialWorkspace(next);
  return next;
}

export function addReceiptRecord(
  state: FinancialWorkspaceState,
  input: {
    vendorName: string;
    amount: number;
    date: string;
    sourceType: ReceiptRecord['sourceType'];
    linkedInvoiceId?: string;
    linkedPaymentId?: string;
    notes?: string;
  }
): FinancialWorkspaceState {
  const receipt: ReceiptRecord = {
    id: makeId('receipt'),
    workspaceId: state.workspaceId,
    vendorName: input.vendorName,
    amount: input.amount,
    date: input.date,
    sourceType: input.sourceType,
    linkedInvoiceId: input.linkedInvoiceId,
    linkedPaymentId: input.linkedPaymentId,
    notes: input.notes,
  };

  const next: FinancialWorkspaceState = {
    ...state,
    receipts: [receipt, ...state.receipts],
    updatedAt: nowIso(),
  };

  saveFinancialWorkspace(next);
  return next;
}

export function approveObligation(
  state: FinancialWorkspaceState,
  obligationId: string,
  approvedAmount: number
): FinancialWorkspaceState {
  const next: FinancialWorkspaceState = {
    ...state,
    obligations: state.obligations.map((obligation) =>
      obligation.id === obligationId
        ? {
            ...obligation,
            approvedAmount,
            status: 'approved',
            updatedAt: nowIso(),
          }
        : obligation
    ),
    updatedAt: nowIso(),
  };

  saveFinancialWorkspace(next);
  return next;
}

export function setInvoiceStatus(
  state: FinancialWorkspaceState,
  invoiceId: string,
  status: InvoiceRecord['status']
): FinancialWorkspaceState {
  const next: FinancialWorkspaceState = {
    ...state,
    invoices: state.invoices.map((invoice) =>
      invoice.id === invoiceId ? { ...invoice, status } : invoice
    ),
    updatedAt: nowIso(),
  };

  saveFinancialWorkspace(next);
  return next;
}

export function addReviewFlag(
  state: FinancialWorkspaceState,
  input: {
    targetType: ReviewFlag['targetType'];
    targetId: string;
    flagType: ReviewFlagType;
    severity: ReviewFlagSeverity;
    explanation: string;
  }
): FinancialWorkspaceState {
  const flag = buildFlag(
    state.workspaceId,
    input.targetType,
    input.targetId,
    input.flagType,
    input.severity,
    input.explanation
  );

  const next: FinancialWorkspaceState = {
    ...state,
    flags: [flag, ...state.flags],
    updatedAt: nowIso(),
  };

  saveFinancialWorkspace(next);
  return next;
}

export function resolveReviewFlag(
  state: FinancialWorkspaceState,
  flagId: string
): FinancialWorkspaceState {
  const next: FinancialWorkspaceState = {
    ...state,
    flags: state.flags.map((flag) =>
      flag.id === flagId ? { ...flag, status: 'resolved', resolvedAt: nowIso() } : flag
    ),
    updatedAt: nowIso(),
  };

  saveFinancialWorkspace(next);
  return next;
}

export function upsertBudget(
  state: FinancialWorkspaceState,
  input: {
    projectedLow: number;
    projectedHigh: number;
    allocatedTotal: number;
    availableFunds?: number;
    notes?: string;
  }
): FinancialWorkspaceState {
  const actualSpend = state.payments
    .filter((payment) => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const nextBudget: WorkspaceBudget = {
    id: state.budget?.id || makeId('budget'),
    workspaceId: state.workspaceId,
    projectedLow: input.projectedLow,
    projectedHigh: input.projectedHigh,
    allocatedTotal: input.allocatedTotal,
    availableFunds: input.availableFunds,
    actualSpend,
    categoryAllocations: state.budget?.categoryAllocations || [],
    notes: input.notes,
    updatedAt: nowIso(),
  };

  const next: FinancialWorkspaceState = {
    ...state,
    budget: nextBudget,
    updatedAt: nowIso(),
  };

  saveFinancialWorkspace(next);
  return next;
}

export function upsertEstimate(
  state: FinancialWorkspaceState,
  input: {
    lowEstimate: number;
    highEstimate: number;
    confidence: CostEstimate['confidence'];
    assumptions: string;
  }
): FinancialWorkspaceState {
  const nextEstimate: CostEstimate = {
    id: state.estimate?.id || makeId('estimate'),
    workspaceId: state.workspaceId,
    lowEstimate: input.lowEstimate,
    highEstimate: input.highEstimate,
    confidence: input.confidence,
    assumptions: input.assumptions,
    expectedUpcomingCosts: state.estimate?.expectedUpcomingCosts || [],
    createdAt: state.estimate?.createdAt || nowIso(),
    updatedAt: nowIso(),
  };

  const next: FinancialWorkspaceState = {
    ...state,
    estimate: nextEstimate,
    updatedAt: nowIso(),
  };

  saveFinancialWorkspace(next);
  return next;
}

export function createExactMatch(
  state: FinancialWorkspaceState,
  invoiceId: string,
  paymentId: string
): FinancialWorkspaceState {
  const invoice = state.invoices.find((item) => item.id === invoiceId);
  const payment = state.payments.find((item) => item.id === paymentId);

  if (!invoice || !payment) return state;

  const match: ReconciliationMatch = {
    id: makeId('match'),
    workspaceId: state.workspaceId,
    invoiceId,
    paymentId,
    matchType: 'exact',
    confidence: invoice.total === payment.amount ? 1 : 0.7,
    discrepancyReason: invoice.total === payment.amount ? undefined : 'Amounts differ.',
    status: invoice.total === payment.amount ? 'matched' : 'partial_match',
    reviewedAt: nowIso(),
  };

  const next: FinancialWorkspaceState = {
    ...state,
    matches: [match, ...state.matches],
    updatedAt: nowIso(),
  };

  saveFinancialWorkspace(next);
  return next;
}

export function clearFinancialWorkspace(workspaceId: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(storageKey(workspaceId));
}
