import React, { useMemo, useState } from "react";
import type { StrategicIntakeItem } from "../../types/strategicIntake";
import { evaluateStrategicInput } from "../../lib/strategic/strategicRouter";
import {
  listStrategicItems,
  saveStrategicItems,
  clearStrategicItems,
} from "../../lib/strategic/strategicStore";

function badgeClass(decision: StrategicIntakeItem["decision"]): string {
  switch (decision) {
    case "build-now":
      return "bg-emerald-100 text-emerald-800";
    case "patch-queue":
      return "bg-blue-100 text-blue-800";
    case "need-later":
      return "bg-amber-100 text-amber-900";
    case "archive-reference":
      return "bg-slate-100 text-slate-700";
  }
}

export default function StrategicIntakeView() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<StrategicIntakeItem[]>(listStrategicItems());

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [items],
  );

  const buildNow = sorted.filter((item) => item.decision === "build-now");
  const patchQueue = sorted.filter((item) => item.decision === "patch-queue");

  function persist(next: StrategicIntakeItem[]) {
    setItems(saveStrategicItems(next));
  }

  function submit() {
    if (!text.trim()) return;
    const evaluated = evaluateStrategicInput(text.trim());
    persist([evaluated, ...items]);
    setText("");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Strategic Intake</h2>
        <p className="mt-1 text-sm text-slate-500">
          Capture raw build signal and route it into usable action.
        </p>

        <div className="mt-4 space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Enter an idea, need, patch request, workflow pressure, or system suggestion."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm"
          />
          <div className="flex gap-3">
            <button
              onClick={submit}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
            >
              Evaluate
            </button>
            <button
              onClick={() => {
                clearStrategicItems();
                setItems([]);
              }}
              className="rounded-xl border border-rose-300 px-4 py-3 text-sm font-medium text-rose-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Current Build Signal</h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-emerald-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Build Now
              </div>
              <div className="mt-2 text-sm text-emerald-900">
                {buildNow[0]?.text || "No item currently marked build-now."}
              </div>
            </div>

            <div className="rounded-xl bg-blue-50 p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Patch Queue
              </div>
              <div className="mt-2 text-sm text-blue-900">
                {patchQueue[0]?.text || "No patch-queue item yet."}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Decision Logic</h3>
          <ul className="mt-4 space-y-2 text-sm text-slate-700">
            <li>Build now when current workflow value is high.</li>
            <li>Patch queue when useful but not the immediate move.</li>
            <li>Need later when signal matters but timing is not right.</li>
            <li>Archive/reference when preservation matters more than action.</li>
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <div className="text-sm font-medium text-slate-700">Captured Strategic Items</div>
        </div>

        <div className="divide-y divide-slate-200">
          {sorted.length === 0 ? (
            <div className="px-6 py-8 text-sm text-slate-500">
              No strategic intake captured yet.
            </div>
          ) : (
            sorted.map((item) => (
              <div key={item.id} className="px-6 py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-slate-900">{item.text}</div>
                    <div className="text-xs text-slate-500">
                      {item.category} Â· {item.createdAt}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass(item.decision)}`}>
                    {item.decision}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Next Action
                    </div>
                    <div className="mt-2 text-sm text-slate-800">{item.recommendedNextAction}</div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Score
                    </div>
                    <div className="mt-2 text-sm text-slate-800">{item.score.total} / 50</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.reason.map((reason, idx) => (
                    <span
                      key={`${item.id}-${idx}`}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700"
                    >
                      {reason}
                    </span>
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
