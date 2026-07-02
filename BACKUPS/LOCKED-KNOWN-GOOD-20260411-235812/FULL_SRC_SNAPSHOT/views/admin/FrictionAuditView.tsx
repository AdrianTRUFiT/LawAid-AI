import React, { useMemo, useState } from "react";
import {
  addFrictionAuditEntry,
  clearFrictionAudit,
  exportFrictionAudit,
  listFrictionAuditEntries,
  updateFrictionAuditStatus,
  type FrictionCategory,
  type FrictionSeverity,
} from "../../lib/audit/frictionAuditStore";

const categories: FrictionCategory[] = [
  "structural",
  "workflow",
  "missing-artifact",
  "visibility",
  "automation",
  "manual-safety",
  "continuity",
  "retrieval",
  "operator-burden",
];

const severities: FrictionSeverity[] = ["low", "medium", "high"];

export default function FrictionAuditView() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<FrictionCategory>("workflow");
  const [severity, setSeverity] = useState<FrictionSeverity>("medium");
  const [version, setVersion] = useState(0);

  const entries = useMemo(() => listFrictionAuditEntries(), [version]);

  function refresh() {
    setVersion((value) => value + 1);
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!title.trim() || !description.trim()) {
      return;
    }

    addFrictionAuditEntry({
      title: title.trim(),
      description: description.trim(),
      category,
      severity,
      stageContext: "live-use",
      status: "open",
    });

    setTitle("");
    setDescription("");
    setCategory("workflow");
    setSeverity("medium");
    refresh();
  }

  function handleExport() {
    const blob = new Blob([exportFrictionAudit()], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "lawaidai-friction-audit.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Friction Audit</h2>
        <p className="mt-1 text-sm text-slate-500">
          Pressure-test capture surface for Step 9 and Step 10.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              placeholder="What broke or slowed you down?"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Category
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as FrictionCategory)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              placeholder="Describe the exact friction, missing artifact, visibility issue, or manual burden."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Severity
            </label>
            <select
              value={severity}
              onChange={(event) => setSeverity(event.target.value as FrictionSeverity)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            >
              {severities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-3">
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
            >
              Save friction entry
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => {
                clearFrictionAudit();
                refresh();
              }}
              className="rounded-xl border border-rose-300 px-4 py-3 text-sm font-medium text-rose-700"
            >
              Clear
            </button>
          </div>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="text-sm font-medium text-slate-700">
            Entries: {entries.length}
          </div>
        </div>

        <div className="divide-y divide-slate-200">
          {entries.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              No friction entries yet.
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className="px-6 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {entry.title}
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {entry.createdAt}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {entry.category}
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                      {entry.severity}
                    </span>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                      {entry.status}
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-sm text-slate-700">{entry.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {["open", "reviewed", "planned", "resolved"].map((status) => (
                    <button
                      key={`${entry.id}-${status}`}
                      type="button"
                      onClick={() => {
                        updateFrictionAuditStatus(
                          entry.id,
                          status as "open" | "reviewed" | "planned" | "resolved",
                        );
                        refresh();
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
                    >
                      Mark {status}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}