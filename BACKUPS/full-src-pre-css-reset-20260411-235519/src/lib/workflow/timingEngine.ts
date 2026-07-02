import type { WorkflowItem, TimingState } from "../../types/workflow";

function daysUntil(dateIso?: string): number | null {
  if (!dateIso) return null;
  const diff = new Date(dateIso).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function computeTimingState(item: WorkflowItem): TimingState {
  const days = daysUntil(item.dueAt);

  if (item.actionState === "awaiting-response") {
    return "follow-up-now";
  }

  if (days === null) {
    return item.actionState === "ready-to-send" ? "action-needed" : "none";
  }

  if (days < 0) return "overdue";
  if (days <= 1) return "deadline-risk";
  if (days <= 3) return "due-soon";

  return item.actionState === "ready-to-send" ? "action-needed" : "none";
}

export function applyTimingState(item: WorkflowItem): WorkflowItem {
  return {
    ...item,
    timingState: computeTimingState(item),
  };
}