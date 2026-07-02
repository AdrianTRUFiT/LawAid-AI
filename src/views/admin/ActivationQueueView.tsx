import React from "react";
import snapshot from "../../dev/activationQueue.snapshot.json";

type QueueItem = {
  handoffId: string;
  reviewedPath: string | null;
  reviewedStatus: string;
  shellPath: string | null;
  activationEnvelopePath: string | null;
  liveRecordPath: string | null;
  transactionStateId: string | null;
  activationKey: string | null;
  status: "reviewed" | "shell-only" | "activated" | "live" | "unknown";
  notes: string[];
};

type QueueSnapshot = {
  generatedAt: string | null;
  projectRoot: string;
  items: QueueItem[];
};

const data = snapshot as QueueSnapshot;

function badgeClass(status: QueueItem["status"]): string {
  switch (status) {
    case "live":
      return "bg-emerald-100 text-emerald-700";
    case "activated":
      return "bg-blue-100 text-blue-700";
    case "shell-only":
      return "bg-amber-100 text-amber-700";
    case "reviewed":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-rose-100 text-rose-700";
  }
}

export default function ActivationQueueView() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Activation Queue
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Reviewed-shell to live-record visibility surface.
            </p>
          </div>
          <div className="text-xs text-slate-500">
            Snapshot generated: {data.generatedAt || "not yet generated"}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="text-sm font-medium text-slate-700">
            Items: {data.items.length}
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {data.items.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              No activation queue items found yet. Generate a snapshot after
              running intake / activation flows.
            </div>
          ) : (
            data.items.map((item) => (
              <div key={item.handoffId} className="px-6 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-900">
                      {item.handoffId}
                    </div>
                    <div className="text-xs text-slate-500">
                      transactionStateId: {item.transactionStateId || "none"}
                    </div>
                    <div className="text-xs text-slate-500">
                      activationKey: {item.activationKey || "none"}
                    </div>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badgeClass(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4 text-sm">
                    <div className="font-medium text-slate-800">Reviewed</div>
                    <div className="mt-1 text-slate-600">
                      status: {item.reviewedStatus}
                    </div>
                    <div className="mt-1 break-all text-xs text-slate-500">
                      {item.reviewedPath || "none"}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 text-sm">
                    <div className="font-medium text-slate-800">Shell</div>
                    <div className="mt-1 break-all text-xs text-slate-500">
                      {item.shellPath || "none"}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 text-sm">
                    <div className="font-medium text-slate-800">
                      Activation Envelope
                    </div>
                    <div className="mt-1 break-all text-xs text-slate-500">
                      {item.activationEnvelopePath || "none"}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 text-sm">
                    <div className="font-medium text-slate-800">
                      Live System Record
                    </div>
                    <div className="mt-1 break-all text-xs text-slate-500">
                      {item.liveRecordPath || "none"}
                    </div>
                  </div>
                </div>

                {item.notes.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                      Notes
                    </div>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-900">
                      {item.notes.map((note, idx) => (
                        <li key={`${item.handoffId}-note-${idx}`}>{note}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
