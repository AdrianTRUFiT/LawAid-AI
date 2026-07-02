// src/lib/financial/paymentGovernanceSelectors.ts

import type { InvoiceRecord, PaymentRecord } from '../../types/financial';
import type {
  PaymentGovernanceState,
  ScheduledPayment,
} from '../../types/paymentGovernance';

export function selectDefaultPaymentSource(state: PaymentGovernanceState) {
  return (
    state.sources.find((source) => source.isDefault && source.status === 'active') ||
    state.sources.find((source) => source.status === 'active') ||
    null
  );
}

export function selectLatestEvaluation(
  state: PaymentGovernanceState,
  invoiceId: string
) {
  return state.evaluations.find((item) => item.invoiceId === invoiceId) || null;
}

export function selectLatestAuthorization(
  state: PaymentGovernanceState,
  invoiceId: string
) {
  return state.authorizations.find(
    (item) => item.invoiceId === invoiceId && item.status === 'approved'
  ) || null;
}

export function selectScheduledPaymentForInvoice(
  state: PaymentGovernanceState,
  invoiceId: string
): ScheduledPayment | null {
  return (
    state.scheduledPayments.find(
      (item) =>
        item.invoiceId === invoiceId &&
        ['scheduled', 'ready', 'facilitated'].includes(item.status)
    ) || null
  );
}

export function selectQueueCandidates(
  invoices: InvoiceRecord[],
  payments: PaymentRecord[],
  governance: PaymentGovernanceState
) {
  return invoices
    .map((invoice) => {
      const paidAmount = payments
        .filter((payment) => payment.invoiceId === invoice.id && payment.status === 'paid')
        .reduce((sum, payment) => sum + payment.amount, 0);

      const balance = Math.max(0, invoice.total - paidAmount);
      const evaluation = selectLatestEvaluation(governance, invoice.id);
      const authorization = selectLatestAuthorization(governance, invoice.id);
      const scheduled = selectScheduledPaymentForInvoice(governance, invoice.id);

      return {
        invoice,
        balance,
        evaluation,
        authorization,
        scheduled,
        needsQueueAction: balance > 0,
      };
    })
    .filter((item) => item.needsQueueAction)
    .sort((a, b) => a.invoice.dueDate.localeCompare(b.invoice.dueDate));
}

export function selectGovernanceSummary(
  governance: PaymentGovernanceState
) {
  return {
    sources: governance.sources.length,
    approvedAuthorizations: governance.authorizations.filter((item) => item.status === 'approved').length,
    scheduledPayments: governance.scheduledPayments.filter((item) => item.status === 'scheduled').length,
    proofBundles: governance.proofBundles.length,
  };
}