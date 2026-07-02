// src/components/financial/PreProcessorGovernancePanel.tsx

import React, { useMemo, useState } from 'react';
import type { InvoiceRecord, PaymentRecord } from '../../types/financial';
import type { PreProcessorGovernanceState } from '../../types/preProcessorPayments';
import {
  addAuthorizationRule,
  addPaymentSource,
  authorizePaymentIntent,
  createPaymentIntent,
  queueScheduledTransaction,
  recordProcessorConfirmation,
  submitAuthorizedTransaction,
  validatePaymentIntent,
} from '../../lib/financial/preProcessorGovernanceStore';
import {
  selectDefaultPreProcessorSource,
  selectPreProcessorSummary,
  selectQueueInvoices,
  selectRuleForSource,
} from '../../lib/financial/preProcessorSelectors';

type Props = {
  workspaceId: string;
  matterId: string;
  governance: PreProcessorGovernanceState;
  invoices: InvoiceRecord[];
  payments?: PaymentRecord[];
  obligations?: unknown[];
  onGovernanceChange: (next: PreProcessorGovernanceState) => void;
  onRecordPayment?: (input: {
    vendorName: string;
    amount: number;
    datePaid: string;
    paymentMethodSummary: string;
    invoiceId?: string;
    notes?: string;
  }) => string | undefined;
};

export default function PreProcessorGovernancePanel({
  workspaceId,
  matterId,
  governance,
  invoices,
  payments = [],
  onGovernanceChange,
  onRecordPayment,
}: Props) {
  const safePaymentSources = governance?.paymentSources ?? [];
  const safeAuthorizationRules = governance?.authorizationRules ?? [];
  const safePaymentIntents = governance?.paymentIntents ?? [];
  const safeAuthorizations = governance?.authorizations ?? [];
  const safeTransactions = governance?.transactions ?? [];
  const safeScheduledTransactions = governance?.scheduledTransactions ?? [];
  const safeProcessingRecords = governance?.processingRecords ?? [];
  const safeReviews = governance?.preProcessorReviews ?? [];
  const safeAnomalies = governance?.anomalies ?? [];

  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  const [sourceForm, setSourceForm] = useState({
    sourceType: 'external_manual',
    label: '',
    last4: '',
    cardBrand: '',
    billingName: '',
    isPreapproved: false,
  });

  const [ruleForm, setRuleForm] = useState({
    approvalMode: 'manual_only',
    maxSingleTransaction: '',
    maxMonthlyProcessing: '',
    allowedCategories: 'legal_fee',
    requiresManualReviewAbove: '',
    autoPayEnabled: false,
  });

  const summary = useMemo(
    () =>
      selectPreProcessorSummary({
        ...governance,
        paymentIntents: safePaymentIntents,
        authorizations: safeAuthorizations,
        scheduledTransactions: safeScheduledTransactions,
        anomalies: safeAnomalies,
      }),
    [
      governance,
      safePaymentIntents,
      safeAuthorizations,
      safeScheduledTransactions,
      safeAnomalies,
    ]
  );

  const queue = useMemo(
    () =>
      selectQueueInvoices(invoices, payments, {
        ...governance,
        preProcessorReviews: safeReviews,
        transactions: safeTransactions,
        authorizations: safeAuthorizations,
        scheduledTransactions: safeScheduledTransactions,
        processingRecords: safeProcessingRecords,
      }),
    [
      invoices,
      payments,
      governance,
      safeReviews,
      safeTransactions,
      safeAuthorizations,
      safeScheduledTransactions,
      safeProcessingRecords,
    ]
  );

  const selected =
    queue.find((item) => item.invoice.id === selectedInvoiceId) || queue[0] || null;

  const defaultSource = selectDefaultPreProcessorSource({
    ...governance,
    paymentSources: safePaymentSources,
  });

  const currentRule = selectRuleForSource(
    {
      ...governance,
      authorizationRules: safeAuthorizationRules,
    },
    defaultSource?.id
  );

  const handleAddSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceForm.label.trim()) return;

    const next = addPaymentSource(
      {
        ...governance,
        paymentSources: safePaymentSources,
      },
      {
        matterId,
        sourceType: sourceForm.sourceType as any,
        label: sourceForm.label.trim(),
        last4: sourceForm.last4.trim() || undefined,
        cardBrand: sourceForm.cardBrand.trim() || undefined,
        billingName: sourceForm.billingName.trim() || undefined,
        isDefault: safePaymentSources.length === 0,
        isPreapproved: sourceForm.isPreapproved,
      }
    );

    onGovernanceChange(next);

    setSourceForm({
      sourceType: 'external_manual',
      label: '',
      last4: '',
      cardBrand: '',
      billingName: '',
      isPreapproved: false,
    });
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();

    const next = addAuthorizationRule(
      {
        ...governance,
        authorizationRules: safeAuthorizationRules,
      },
      {
        matterId,
        paymentSourceId: defaultSource?.id,
        approvalMode: ruleForm.approvalMode as any,
        maxSingleTransaction: ruleForm.maxSingleTransaction
          ? Number(ruleForm.maxSingleTransaction)
          : undefined,
        maxMonthlyProcessing: ruleForm.maxMonthlyProcessing
          ? Number(ruleForm.maxMonthlyProcessing)
          : undefined,
        allowedCategories: ruleForm.allowedCategories
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean),
        requiresManualReviewAbove: ruleForm.requiresManualReviewAbove
          ? Number(ruleForm.requiresManualReviewAbove)
          : undefined,
        autoPayEnabled: ruleForm.autoPayEnabled,
      }
    );

    onGovernanceChange(next);
  };

  const handleCreateIntent = (invoice: InvoiceRecord, balance: number) => {
    const { state: next } = createPaymentIntent(
      {
        ...governance,
        paymentIntents: safePaymentIntents,
        transactions: safeTransactions,
      },
      {
        matterId,
        payerId: 'client_user',
        payeeId: invoice.vendorName,
        obligationId: invoice.id,
        invoiceId: invoice.id,
        amount: balance,
        currency: invoice.currency || 'USD',
        reasonCode: ((invoice.lineItems?.[0]?.category as any) || 'legal_invoice'),
        dueDate: invoice.dueDate,
        approvalMode: currentRule?.approvalMode || 'manual_only',
        supportingRefs: invoice.supportingDocumentIds || [],
      }
    );

    onGovernanceChange(next);
  };

  const handleValidate = (invoice: InvoiceRecord) => {
    const intent = safePaymentIntents.find((item) => item.invoiceId === invoice.id);
    if (!intent) return;

    const next = validatePaymentIntent(
      {
        ...governance,
        paymentIntents: safePaymentIntents,
        preProcessorReviews: safeReviews,
        anomalies: safeAnomalies,
      },
      {
        paymentIntentId: intent.id,
        invoice,
        payments,
      }
    );

    onGovernanceChange(next);
  };

  const handleAuthorize = (invoice: InvoiceRecord) => {
    const intent = safePaymentIntents.find((item) => item.invoiceId === invoice.id);
    if (!intent) return;

    const next = authorizePaymentIntent(
      {
        ...governance,
        paymentIntents: safePaymentIntents,
        authorizations: safeAuthorizations,
        transactions: safeTransactions,
        preProcessorReviews: safeReviews,
      },
      {
        paymentIntentId: intent.id,
        invoice,
        userId: 'Adrian',
      }
    );

    onGovernanceChange(next);
  };

  const handleQueue = (transactionId?: string) => {
    if (!transactionId) return;
    const next = queueScheduledTransaction(
      {
        ...governance,
        transactions: safeTransactions,
        scheduledTransactions: safeScheduledTransactions,
        preProcessorReviews: safeReviews,
      },
      transactionId
    );
    onGovernanceChange(next);
  };

  const handleSubmit = (scheduledId?: string) => {
    if (!scheduledId) return;
    const next = submitAuthorizedTransaction(
      {
        ...governance,
        scheduledTransactions: safeScheduledTransactions,
        processingRecords: safeProcessingRecords,
        transactions: safeTransactions,
      },
      scheduledId
    );
    onGovernanceChange(next);
  };

  const handleConfirm = (invoice: InvoiceRecord, processingId?: string) => {
    if (!processingId) return;

    const transaction = safeTransactions.find((item) => item.linkedInvoiceId === invoice.id);
    if (!transaction) return;

    const paymentRecordId = onRecordPayment?.({
      vendorName: invoice.vendorName,
      amount: transaction.amountApproved || transaction.amountExpected,
      datePaid: new Date().toISOString().slice(0, 10),
      paymentMethodSummary: 'Pre-Processor Facilitated',
      invoiceId: invoice.id,
      notes: 'Recorded after processor confirmation shell.',
    });

    const next = recordProcessorConfirmation(
      {
        ...governance,
        processingRecords: safeProcessingRecords,
        transactions: safeTransactions,
        anomalies: safeAnomalies,
      },
      {
        processingRecordId: processingId,
        amountPaid: transaction.amountApproved || transaction.amountExpected,
        actualPayeeId: invoice.vendorName,
        paymentRecordId,
      }
    );

    onGovernanceChange(next);
  };

  const openAnomalies = safeAnomalies.filter((item) => item.status === 'open');

  const existingIntent = selected
    ? safePaymentIntents.find((item) => item.invoiceId === selected.invoice.id)
    : null;

  const existingAuthorization = selected?.authorization ?? null;
  const existingScheduled = selected?.scheduled ?? null;
  const existingProcessing = selected?.processing ?? null;
  const hasReviewReasons = (selected?.review?.reviewReasons?.length || 0) > 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <SummaryCard label="Payment Intents" value={String(summary.intents)} />
        <SummaryCard label="Authorizations" value={String(summary.authorized)} />
        <SummaryCard label="Scheduled" value={String(summary.scheduled)} />
        <SummaryCard label="Sources" value={String(safePaymentSources.length)} />
        <SummaryCard label="Anomalies" value={String(summary.anomalies)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <Panel title="Build Position">
            <div className="space-y-3 text-sm text-slate-700">
              <p>
                LawAidAI is acting here as the <strong>pre-processor decision layer</strong>{' '}
                for case-related payments.
              </p>
              <ul className="space-y-1 text-slate-600">
                <li>• client-side management software</li>
                <li>• transaction-accountability and orchestration software</li>
                <li>• not a bank</li>
                <li>• not pooled-funds custody</li>
                <li>• not a trust-account substitute</li>
              </ul>
            </div>
          </Panel>

          <Panel title="Payment Sources">
            <form onSubmit={handleAddSource} className="space-y-4">
              <Select
                label="Source type"
                value={sourceForm.sourceType}
                onChange={(value) =>
                  setSourceForm((prev) => ({ ...prev, sourceType: value }))
                }
                options={[
                  { value: 'external_manual', label: 'External Manual' },
                  { value: 'card', label: 'Card' },
                  { value: 'bank_account', label: 'Bank Account' },
                  { value: 'other', label: 'Other' },
                ]}
              />
              <Input
                label="Label"
                value={sourceForm.label}
                onChange={(value) =>
                  setSourceForm((prev) => ({ ...prev, label: value }))
                }
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Last 4"
                  value={sourceForm.last4}
                  onChange={(value) =>
                    setSourceForm((prev) => ({ ...prev, last4: value }))
                  }
                />
                <Input
                  label="Card brand"
                  value={sourceForm.cardBrand}
                  onChange={(value) =>
                    setSourceForm((prev) => ({ ...prev, cardBrand: value }))
                  }
                />
              </div>
              <Input
                label="Billing name"
                value={sourceForm.billingName}
                onChange={(value) =>
                  setSourceForm((prev) => ({ ...prev, billingName: value }))
                }
              />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={sourceForm.isPreapproved}
                  onChange={(e) =>
                    setSourceForm((prev) => ({
                      ...prev,
                      isPreapproved: e.target.checked,
                    }))
                  }
                />
                Preapproved
              </label>

              <button className="rounded-xl bg-legal-navy px-4 py-2 text-sm font-bold text-white">
                Add Payment Source
              </button>
            </form>

            {safePaymentSources.length > 0 ? (
              <div className="mt-5 space-y-2">
                {safePaymentSources.map((source) => (
                  <div
                    key={source.id}
                    className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
                  >
                    <div className="font-semibold text-legal-navy">
                      {source.label} {source.isDefault ? '• Default' : ''}
                    </div>
                    <div className="mt-1 text-slate-500">
                      {source.sourceType}
                      {source.last4 ? ` • ****${source.last4}` : ''}
                      {source.cardBrand ? ` • ${source.cardBrand}` : ''}
                      {source.isPreapproved ? ' • Preapproved' : ''}
                      {source.active ? ' • Active' : ' • Inactive'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No payment sources configured yet.
              </div>
            )}
          </Panel>

          <Panel title="Authorization Rules">
            <form onSubmit={handleAddRule} className="space-y-4">
              <Select
                label="Approval mode"
                value={ruleForm.approvalMode}
                onChange={(value) =>
                  setRuleForm((prev) => ({ ...prev, approvalMode: value }))
                }
                options={[
                  { value: 'manual_only', label: 'Manual Only' },
                  { value: 'preapproved_with_rules', label: 'Preapproved With Rules' },
                  { value: 'auto_if_within_rules', label: 'Auto If Within Rules' },
                ]}
              />
              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Max single transaction"
                  value={ruleForm.maxSingleTransaction}
                  onChange={(value) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      maxSingleTransaction: value,
                    }))
                  }
                  type="number"
                />
                <Input
                  label="Max monthly processing"
                  value={ruleForm.maxMonthlyProcessing}
                  onChange={(value) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      maxMonthlyProcessing: value,
                    }))
                  }
                  type="number"
                />
              </div>
              <Input
                label="Allowed categories"
                value={ruleForm.allowedCategories}
                onChange={(value) =>
                  setRuleForm((prev) => ({ ...prev, allowedCategories: value }))
                }
              />
              <Input
                label="Manual review above"
                value={ruleForm.requiresManualReviewAbove}
                onChange={(value) =>
                  setRuleForm((prev) => ({
                    ...prev,
                    requiresManualReviewAbove: value,
                  }))
                }
                type="number"
              />
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={ruleForm.autoPayEnabled}
                  onChange={(e) =>
                    setRuleForm((prev) => ({
                      ...prev,
                      autoPayEnabled: e.target.checked,
                    }))
                  }
                />
                Auto pay enabled
              </label>

              <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-800">
                Save Rule
              </button>
            </form>

            {safeAuthorizationRules.length > 0 ? (
              <div className="mt-5 space-y-2">
                {safeAuthorizationRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
                  >
                    <div className="font-semibold text-legal-navy">
                      {rule.approvalMode}
                    </div>
                    <div className="mt-1 text-slate-500">
                      Categories:{' '}
                      {rule.allowedCategories.length > 0
                        ? rule.allowedCategories.join(', ')
                        : 'none'}
                    </div>
                    <div className="mt-1 text-slate-500">
                      {typeof rule.maxSingleTransaction === 'number'
                        ? `Max ${rule.maxSingleTransaction}`
                        : 'No single cap'}
                      {typeof rule.requiresManualReviewAbove === 'number'
                        ? ` • Review above ${rule.requiresManualReviewAbove}`
                        : ''}
                      {rule.autoPayEnabled ? ' • Auto pay' : ' • Manual path'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No authorization rules configured yet.
              </div>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Payment Queue">
            {queue.length === 0 ? (
              <p className="text-sm text-slate-500">
                No invoices available for pre-processor review.
              </p>
            ) : (
              <div className="space-y-3">
                {queue.map(
                  ({ invoice, balance, review, transaction, scheduled, processing, authorization }) => (
                    <button
                      key={invoice.id}
                      type="button"
                      onClick={() => setSelectedInvoiceId(invoice.id)}
                      className={`w-full rounded-2xl border p-4 text-left transition-all ${
                        selected?.invoice.id === invoice.id
                          ? 'border-amber-300 bg-amber-50'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="font-semibold text-legal-navy">
                        {invoice.vendorName} · {invoice.invoiceNumber}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Balance ${balance.toLocaleString()} · Due {invoice.dueDate}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {review && <Badge text={`Decision: ${review.decisionStatus}`} />}
                        {review && <Badge text={`Validation: ${review.validationStatus}`} />}
                        {authorization && <Badge text={`Auth: ${authorization.status}`} />}
                        {transaction && <Badge text={`Txn: ${transaction.status}`} />}
                        {scheduled && <Badge text={`Scheduled: ${scheduled.status}`} />}
                        {processing && <Badge text={`Processor: ${processing.status}`} />}
                      </div>
                    </button>
                  )
                )}
              </div>
            )}
          </Panel>

          <Panel title="Pre-Processor Review Panel">
            {!selected ? (
              <p className="text-sm text-slate-500">Select an invoice to review.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="text-lg font-bold text-legal-navy">
                    {selected.invoice.vendorName} · {selected.invoice.invoiceNumber}
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    Workspace {workspaceId} · Matter {matterId}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <InfoRow label="What is being paid" value={selected.invoice.invoiceNumber} />
                  <InfoRow
                    label="Why"
                    value={selected.invoice.lineItems?.[0]?.category || 'legal_invoice'}
                  />
                  <InfoRow label="To whom" value={selected.invoice.vendorName} />
                  <InfoRow label="Due date" value={selected.invoice.dueDate || '—'} />
                  <InfoRow label="Balance" value={`$${selected.balance.toLocaleString()}`} />
                  <InfoRow
                    label="Processor status"
                    value={selected.processing?.status || 'not_submitted'}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleCreateIntent(selected.invoice, selected.balance)}
                    disabled={Boolean(existingIntent)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-800 disabled:opacity-50"
                  >
                    Create Intent
                  </button>
                  <button
                    onClick={() => handleValidate(selected.invoice)}
                    disabled={!existingIntent}
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 disabled:opacity-50"
                  >
                    Validate
                  </button>
                  <button
                    onClick={() => handleAuthorize(selected.invoice)}
                    disabled={!existingIntent || Boolean(existingAuthorization)}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 disabled:opacity-50"
                  >
                    Authorize
                  </button>
                  <button
                    onClick={() => handleQueue(selected.transaction?.id)}
                    disabled={!selected.transaction || Boolean(existingScheduled) || hasReviewReasons}
                    className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 disabled:opacity-50"
                  >
                    Queue
                  </button>
                  <button
                    onClick={() => handleSubmit(selected.scheduled?.id)}
                    disabled={!selected.scheduled || Boolean(existingProcessing) || hasReviewReasons}
                    className="rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 disabled:opacity-50"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => handleConfirm(selected.invoice, selected.processing?.id)}
                    disabled={!selected.processing || selected.processing.status === 'confirmed'}
                    className="rounded-lg bg-legal-navy px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
                  >
                    Confirm
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <StatusCard
                    label="Decision Layer"
                    value={selected.review?.decisionStatus || 'not yet run'}
                  />
                  <StatusCard
                    label="Validation Layer"
                    value={selected.review?.validationStatus || 'pending'}
                  />
                  <StatusCard
                    label="Authorization Layer"
                    value={selected.authorization?.status || selected.review?.authorizationStatus || 'pending'}
                  />
                  <StatusCard
                    label="Pre-Reconciliation"
                    value={selected.review?.preReconciliationStatus || 'pending'}
                  />
                </div>

                {selected.review?.refusalReasons?.length > 0 && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                    <div className="font-semibold">Refusal Reasons</div>
                    <ul className="mt-2 space-y-1">
                      {selected.review.refusalReasons.map((reason, index) => (
                        <li key={index}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {selected.review?.reviewReasons?.length > 0 && (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                    <div className="font-semibold">Review Reasons</div>
                    <ul className="mt-2 space-y-1">
                      {selected.review.reviewReasons.map((reason, index) => (
                        <li key={index}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </Panel>

          <Panel title="Open Anomalies">
            {openAnomalies.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No open anomalies.
              </div>
            ) : (
              <div className="space-y-3">
                {openAnomalies.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm"
                  >
                    <div className="font-semibold text-rose-800">
                      {item.type} · {item.severity}
                    </div>
                    <div className="mt-1 text-rose-700">{item.explanation}</div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-legal-border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-legal-navy">{title}</h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold text-legal-navy">{value}</div>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-700">
      {text}
    </span>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
      <div className="font-semibold text-legal-navy">{label}</div>
      <div className="mt-2 text-slate-600">{value}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-slate-400"
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition-all focus:border-slate-400"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-slate-800">{value}</div>
    </div>
  );
}