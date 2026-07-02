import type { InvoiceRecord, PaymentRecord } from '../../types/financial';
import type { PreProcessorGovernanceState } from '../../types/preProcessorPayments';

function safeArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

export function selectDefaultPreProcessorSource(
  state: PreProcessorGovernanceState
) {
  const paymentSources = safeArray(state?.paymentSources);

  return (
    paymentSources.find((item) => item.isDefault && item.active) ||
    paymentSources.find((item) => item.active) ||
    null
  );
}

export function selectRuleForSource(
  state: PreProcessorGovernanceState,
  paymentSourceId?: string
) {
  const authorizationRules = safeArray(state?.authorizationRules);

  return (
    authorizationRules.find(
      (item) =>
        item.active && (!item.paymentSourceId || item.paymentSourceId === paymentSourceId)
    ) || null
  );
}

export function selectQueueInvoices(
  invoices: InvoiceRecord[],
  payments: PaymentRecord[] = [],
  state: PreProcessorGovernanceState
) {
  const safeInvoices = safeArray(invoices);
  const safePayments = safeArray(payments);
  const preProcessorReviews = safeArray(state?.preProcessorReviews);
  const transactions = safeArray(state?.transactions);
  const authorizations = safeArray(state?.authorizations);
  const scheduledTransactions = safeArray(state?.scheduledTransactions);
  const processingRecords = safeArray(state?.processingRecords);

  return safeInvoices
    .map((invoice) => {
      const paidAmount = safePayments
        .filter((payment) => payment.invoiceId === invoice.id && payment.status === 'paid')
        .reduce((sum, payment) => sum + payment.amount, 0);

      const balance = Math.max(0, invoice.total - paidAmount);

      const review =
        preProcessorReviews.find((item) => item.invoiceId === invoice.id) || null;

      const transaction =
        transactions.find((item) => item.linkedInvoiceId === invoice.id) || null;

      const authorization =
        transaction && transaction.linkedAuthorizationId
          ? authorizations.find((item) => item.id === transaction.linkedAuthorizationId) || null
          : null;

      const scheduled =
        transaction
          ? scheduledTransactions.find((item) => item.transactionId === transaction.id) || null
          : null;

      const processing =
        transaction
          ? processingRecords.find((item) => item.transactionId === transaction.id) || null
          : null;

      return {
        invoice,
        balance,
        review,
        transaction,
        authorization,
        scheduled,
        processing,
      };
    })
    .filter((item) => item.balance > 0 || item.processing || item.scheduled)
    .sort((a, b) => (a.invoice.dueDate || '').localeCompare(b.invoice.dueDate || ''));
}

export function selectPreProcessorSummary(
  state: PreProcessorGovernanceState
) {
  const paymentIntents = safeArray(state?.paymentIntents);
  const authorizations = safeArray(state?.authorizations);
  const scheduledTransactions = safeArray(state?.scheduledTransactions);
  const anomalies = safeArray(state?.anomalies);

  return {
    intents: paymentIntents.length,
    authorized: authorizations.filter((item) => item.status === 'authorized').length,
    scheduled: scheduledTransactions.filter((item) => item.status === 'scheduled').length,
    anomalies: anomalies.filter((item) => item.status === 'open').length,
  };
}