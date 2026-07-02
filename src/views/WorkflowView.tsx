import React, { useMemo, useState } from "react";
import { useProject } from "../context/ProjectContext";
import type {
  WorkflowItem,
  PostType,
  RefinementState,
  ActionState,
  OutboxType,
} from "../types/workflow";
import {
  createWorkflowItem,
  setRefinementState,
  setActionState,
  setOutboxType,
} from "../lib/workflow/workflowEngine";
import { applyTimingState } from "../lib/workflow/timingEngine";
import { buildOutboxPreview } from "../lib/workflow/outboxEngine";
import {
  listWorkflowItems,
  saveWorkflowItems,
  clearWorkflowItems,
} from "../lib/workflow/workflowStore";

const postTypes: PostType[] = [
  "incoming-communication",
  "draft-response",
  "document-evidence",
  "request-task",
  "internal-note",
  "filing-formal-draft",
];

const refinementStates: RefinementState[] = [
  "posted",
  "review",
  "compare",
  "consolidate",
  "final-draft",
];

const actionStates: ActionState[] = [
  "in-progress",
  "on-hold",
  "waiting-for-approval",
  "ready-but-held",
  "ready-to-send",
  "sent",
  "awaiting-response",
];

const outboxTypes: OutboxType[] = [
  "none",
  "email-draft",
  "downloadable-document",
  "copy-ready-response",
];

function badgeClass(kind: "refine" | "action" | "timing" | "outbox"): string {
  switch (kind) {
    case "refine":
      return "bg-slate-100 text-slate-700";
    case "action":
      return "bg-blue-100 text-blue-700";
    case "timing":
      return "bg-amber-100 text-amber-800";
    case "outbox":
      return "bg-emerald-100 text-emerald-800";
  }
}

export default function WorkflowView() {
  const { activeProject } = useProject();
  const [items, setItems] = useState<WorkflowItem[]>(listWorkflowItems());
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [postType, setPostType] = useState<PostType>("incoming-communication");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [items],
  );

  const selected = sorted.find((item) => item.id === selectedId) || null;

  function persist(next: WorkflowItem[]) {
    setItems(saveWorkflowItems(next));
  }

  function addItem() {
    if (!title.trim()) return;

    const next = applyTimingState(
      createWorkflowItem({
        projectId: activeProject?.id || "demo-project",
        title: title.trim(),
        description: description.trim() || undefined,
        postType,
      }),
    );

    persist([next, ...items]);
    setTitle("");
    setDescription("");
    setPostType("incoming-communication");
    setSelectedId(next.id);
  }

  function updateItem(id: string, updater: (item: WorkflowItem) => WorkflowItem) {
    const next = items.map((item) =>
      item.id === id ? applyTimingState(updater(item)) : item,
    );
    persist(next);
  }

  const outboxPreview = selected ? buildOutboxPreview(selected) : null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Workflow</h2>
        <p className="mt-1 text-sm text-slate-500">
          Post → Review → Compare → Consolidate → Final Draft
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Post title"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
          />
          <select
            value={postType}
            onChange={(e) => setPostType(e.target.value as PostType)}
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
          >
            {postTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Description / notes"
            className="rounded-xl border border-slate-300 px-4 py-3 text-sm md:col-span-2"
          />
          <div className="flex gap-3 md:col-span-2">
            <button
              onClick={addItem}
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white"
            >
              Add Post
            </button>
            <button
              onClick={() => {
                clearWorkflowItems();
                setItems([]);
                setSelectedId(null);
              }}
              className="rounded-xl border border-rose-300 px-4 py-3 text-sm font-medium text-rose-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr,0.9fr]">
        <div className="space-y-4">
          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              No workflow items yet.
            </div>
          ) : (
            sorted.map((item) => (
              <div
                key={item.id}
                className={`rounded-2xl border bg-white p-6 shadow-sm ${
                  selectedId === item.id ? "border-slate-400" : "border-slate-200"
                }`}
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <button
                      onClick={() => setSelectedId(item.id)}
                      className="text-left text-lg font-semibold text-slate-900"
                    >
                      {item.title}
                    </button>
                    <div className="mt-1 text-xs text-slate-500">{item.postType}</div>
                    {item.description && (
                      <p className="mt-3 text-sm text-slate-600">{item.description}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass("refine")}`}>
                      {item.refinementState}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass("action")}`}>
                      {item.actionState}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass("timing")}`}>
                      {item.timingState}
                    </span>
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass("outbox")}`}>
                      {item.outboxType}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <select
                    value={item.refinementState}
                    onChange={(e) =>
                      updateItem(item.id, (current) =>
                        setRefinementState(current, e.target.value as RefinementState),
                      )
                    }
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                  >
                    {refinementStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>

                  <select
                    value={item.actionState}
                    onChange={(e) =>
                      updateItem(item.id, (current) =>
                        setActionState(current, e.target.value as ActionState),
                      )
                    }
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                  >
                    {actionStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>

                  <select
                    value={item.outboxType}
                    onChange={(e) =>
                      updateItem(item.id, (current) =>
                        setOutboxType(current, e.target.value as OutboxType),
                      )
                    }
                    className="rounded-xl border border-slate-300 px-4 py-3 text-sm"
                  >
                    {outboxTypes.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Next Recommended Action
                  </div>
                  <div className="mt-2">{item.nextRecommendedAction || "None"}</div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Assisted Outbox</h3>
            <p className="mt-1 text-sm text-slate-500">
              Preview-only. No direct send yet.
            </p>

            {!selected || !outboxPreview ? (
              <div className="mt-4 text-sm text-slate-500">
                Select a workflow item to preview its outbox output.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Mode
                  </div>
                  <div className="mt-1 text-sm text-slate-800">{outboxPreview.mode}</div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Subject
                  </div>
                  <div className="mt-1 rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
                    {outboxPreview.subject}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Body
                  </div>
                  <pre className="mt-1 whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-slate-800">
                    {outboxPreview.body}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}