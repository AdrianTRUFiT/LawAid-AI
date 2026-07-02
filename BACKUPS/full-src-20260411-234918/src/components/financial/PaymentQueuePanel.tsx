import React, { useMemo } from "react";
import type { InvoiceRecord, PaymentRecord } from "../../types/financial";
import type { PreProcessorGovernanceState } from "../../types/preProcessorPayments";

type Props = {
  invoices: InvoiceRecord[];
  payments: PaymentRecord[];
  governance: PreProcessorGovernanceState;
  onGovernanceChange: (next: PreProcessorGovernanceState) => void;
  onRecordPayment: (input: {
    vendorName: string;
    amount: number;
    datePaid: string;
    paymentMethodSummary: string;
    invoiceId?: string;
    notes?: string;
  }) => string | undefined;
};

export default function PaymentQueuePanel({
  invoices,
  payments,
  governance,
}: Props) {
  const openInvoices = useMemo(
    () => invoices.filter((invoice) => invoice.status !== "paid"),
    [invoices],
  );

  const totalOutstanding = useMemo(
    () =>
      openInvoices.reduce((sum, invoice) => {
        const paid = payments
          .filter((payment) => payment.invoiceId === invoice.id)
          .reduce((acc, payment) => acc + payment.amount, 0);

        return sum + Math.max(0, invoice.total - paid);
      }, 0),
    [openInvoices, payments],
  );

  const summary = {
    paymentSources: governance.paymentSources?.length ?? 0,
    authorizations: governance.authorizations?.length ?? 0,
    scheduledTransactions: governance.scheduledTransactions?.length ?? 0,
    processingRecords: governance.processingRecords?.length ?? 0,
    anomalies: governance.anomalies?.length ?? 0,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <SummaryCard label="Payment Sources" value={String(summary.paymentSources)} />
        <SummaryCard label="Authorizations" value={String(summary.authorizations)} />
        <SummaryCard label="Scheduled" value={String(summary.scheduledTransactions)} />
        <SummaryCard label="Processing" value={String(summary.processingRecords)} />
        <SummaryCard label="Anomalies" value={String(summary.anomalies)} />
      </div>

      <div className="rounded-2xl border border-legal-border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-legal-navy">Payment Queue Compatibility Panel</h2>
        <p className="mt-1 text-sm text-slate-500">
          This surface is temporarily aligned to the current pre-processor governance model.
          It preserves queue visibility while the older payment-governance API is retired.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Stat label="Open invoices" value={String(openInvoices.length)} />
          <Stat label="Recorded payments" value={String(payments.length)} />
          <Stat label="Outstanding balance" value={`$${totalOutstanding.toLocaleString()}`} />
        </div>

        <div className="mt-6 space-y-4">
          {openInvoices.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-500">
              No unpaid invoices currently in queue.
            </div>
          ) : (
            openInvoices.map((invoice) => {
              const paid = payments
                .filter((payment) => payment.invoiceId === invoice.id)
                .reduce((sum, payment) => sum + payment.amount, 0);

              const balance = Math.max(0, invoice.total - paid);

              return (
                <div
                  key={invoice.id}
                  className="rounded-2xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-lg font-bold text-legal-navy">
                        {invoice.vendorName} · {invoice.invoiceNumber}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        Due {invoice.dueDate} · Total ${invoice.total.toLocaleString()} · Balance ${balance.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge text={`Invoice: ${invoice.status}`} />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-xl font-bold text-legal-navy">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 text-base font-semibold text-slate-800">{value}</div>
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