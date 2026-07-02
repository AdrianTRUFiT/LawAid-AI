// src/lib/financial/financialSelectors.ts

import type {
  FinancialAlert,
  FinancialWorkspaceState,
  InvoiceRecord,
  PaymentRecord,
  ReconciliationMatch,
} from '../../types/financial';

export function computeInvoicePaidAmount(
  invoice: InvoiceRecord,
  payments: PaymentRecord[]
) {
  return payments
    .filter((payment) => payment.invoiceId === invoice.id && payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);
}

export function computeInvoiceBalance(
  invoice: InvoiceRecord,
  payments: PaymentRecord[]
) {
  return Math.max(0, invoice.total - computeInvoicePaidAmount(invoice, payments));
}

export function selectLedgerRows(state: FinancialWorkspaceState) {
  const invoiceRows = state.invoices.map((invoice) => ({
    id: `invoice_${invoice.id}`,
    date: invoice.invoiceDate,
    type: 'invoice' as const,
    vendorName: invoice.vendorName,
    label: `Invoice ${invoice.invoiceNumber}`,
    amount: invoice.total,
    status: invoice.status,
  }));

  const paymentRows = state.payments.map((payment) => ({
    id: `payment_${payment.id}`,
    date: payment.datePaid,
    type: 'payment' as const,
    vendorName: payment.vendorName,
    label: `Payment (${payment.paymentMethodSummary})`,
    amount: payment.amount,
    status: payment.status,
  }));

  return [...invoiceRows, ...paymentRows].sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

export function selectUnmatchedInvoices(
  state: FinancialWorkspaceState
): InvoiceRecord[] {
  const matchedInvoiceIds = new Set(
    state.matches
      .filter((match) => match.status === 'matched' || match.status === 'partial_match')
      .map((match) => match.invoiceId)
      .filter(Boolean)
  );

  return state.invoices.filter((invoice) => !matchedInvoiceIds.has(invoice.id));
}

export function selectUnmatchedPayments(state: FinancialWorkspaceState) {
  const matchedPaymentIds = new Set(
    state.matches
      .filter((match) => match.status === 'matched' || match.status === 'partial_match')
      .map((match) => match.paymentId)
      .filter(Boolean)
  );

  return state.payments.filter((payment) => !matchedPaymentIds.has(payment.id));
}

export function selectEligiblePaymentsForInvoice(
  state: FinancialWorkspaceState,
  invoiceId: string
) {
  const invoice = state.invoices.find((item) => item.id === invoiceId);
  if (!invoice) return [];

  const unmatched = selectUnmatchedPayments(state);

  return unmatched.filter((payment) => {
    const vendorMatch =
      payment.vendorName.trim().toLowerCase() === invoice.vendorName.trim().toLowerCase();
    const amountClose = Math.abs(payment.amount - invoice.total) < 0.01;
    return vendorMatch || amountClose;
  });
}

export function deriveFinancialAlerts(
  state: FinancialWorkspaceState
): FinancialAlert[] {
  const alerts: FinancialAlert[] = [];
  const today = new Date();

  state.invoices.forEach((invoice) => {
    const balance = computeInvoiceBalance(invoice, state.payments);
    const dueDate = new Date(invoice.dueDate);
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (balance > 0 && daysUntilDue <= 3 && daysUntilDue >= 0) {
      alerts.push({
        id: `alert_due_${invoice.id}`,
        workspaceId: state.workspaceId,
        type: 'due_soon',
        severity: 'warning',
        title: 'Invoice due soon',
        description: `${invoice.vendorName} invoice ${invoice.invoiceNumber} is due in ${daysUntilDue} day(s).`,
        relatedId: invoice.id,
        createdAt: new Date().toISOString(),
      });
    }

    if (balance > 0 && daysUntilDue < 0) {
      alerts.push({
        id: `alert_overdue_${invoice.id}`,
        workspaceId: state.workspaceId,
        type: 'overdue',
        severity: 'critical',
        title: 'Invoice overdue',
        description: `${invoice.vendorName} invoice ${invoice.invoiceNumber} is overdue and still has a remaining balance.`,
        relatedId: invoice.id,
        createdAt: new Date().toISOString(),
      });
    }
  });

  const unmatchedInvoices = selectUnmatchedInvoices(state);
  unmatchedInvoices.forEach((invoice) => {
    alerts.push({
      id: `alert_unmatched_invoice_${invoice.id}`,
      workspaceId: state.workspaceId,
      type: 'unmatched_invoice',
      severity: 'info',
      title: 'Invoice needs match',
      description: `${invoice.vendorName} invoice ${invoice.invoiceNumber} is not yet reconciled to a payment.`,
      relatedId: invoice.id,
      createdAt: new Date().toISOString(),
    });
  });

  const unmatchedPayments = selectUnmatchedPayments(state);
  unmatchedPayments.forEach((payment) => {
    alerts.push({
      id: `alert_unmatched_payment_${payment.id}`,
      workspaceId: state.workspaceId,
      type: 'unmatched_payment',
      severity: 'info',
      title: 'Payment needs match',
      description: `${payment.vendorName} payment on ${payment.datePaid} is not yet matched to an invoice.`,
      relatedId: payment.id,
      createdAt: new Date().toISOString(),
    });
  });

  if (state.budget) {
    const actualSpend = state.payments
      .filter((payment) => payment.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);

    if (actualSpend > state.budget.allocatedTotal) {
      alerts.push({
        id: 'alert_budget_overrun',
        workspaceId: state.workspaceId,
        type: 'budget_overrun',
        severity: 'critical',
        title: 'Budget overrun',
        description: `Actual spend has exceeded the current allocated budget.`,
        createdAt: new Date().toISOString(),
      });
    }
  }

  state.flags
    .filter((flag) => flag.status === 'open')
    .forEach((flag) => {
      alerts.push({
        id: `alert_flag_${flag.id}`,
        workspaceId: state.workspaceId,
        type: flag.flagType,
        severity:
          flag.severity === 'high'
            ? 'critical'
            : flag.severity === 'medium'
            ? 'warning'
            : 'info',
        title: 'Review flag open',
        description: flag.explanation,
        relatedId: flag.targetId,
        createdAt: flag.createdAt,
      });
    });

  return alerts.sort((a, b) => {
    const rank = { critical: 3, warning: 2, info: 1 };
    return rank[b.severity] - rank[a.severity];
  });
}

export function summarizeReconciliation(state: FinancialWorkspaceState) {
  const matches = state.matches.reduce(
    (acc, match: ReconciliationMatch) => {
      acc[match.status] = (acc[match.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    matched: matches.matched || 0,
    partial: matches.partial_match || 0,
    unmatchedInvoices: selectUnmatchedInvoices(state).length,
    unmatchedPayments: selectUnmatchedPayments(state).length,
  };
}