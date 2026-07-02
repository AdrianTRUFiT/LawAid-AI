import type { WorkflowItem } from "../../types/workflow";
import seedItems from "../../dev/workflowItems.seed.json";
import { applyTimingState } from "./timingEngine";
import {
  buildWorkflowPc2Record,
  buildWorkflowFact2Record
} from "./pc2Fact2WorkflowBridge";

const STORAGE_KEY = "lawaidai-workflow-items";

function safeRead(): WorkflowItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return (seedItems as WorkflowItem[]).map(applyTimingState);
    }
    return (JSON.parse(raw) as WorkflowItem[]).map(applyTimingState);
  } catch {
    return (seedItems as WorkflowItem[]).map(applyTimingState);
  }
}

function safeWrite(items: WorkflowItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function extractWorkflowText(item: WorkflowItem): string {
  const record = item as unknown as Record<string, unknown>;

  const candidates = [
    record["title"],
    record["description"],
    record["summary"],
    record["label"],
    record["name"],
    record["issue"]
  ];

  const firstText = candidates.find(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );

  return firstText ?? "workflow item";
}

function shouldEmitFact2(item: WorkflowItem): boolean {
  const record = item as unknown as Record<string, unknown>;

  const statusFields = [
    record["status"],
    record["timingState"],
    record["refinementState"],
    record["frictionState"],
    record["priority"]
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  const description = extractWorkflowText(item).toLowerCase();

  return (
    statusFields.includes("blocked") ||
    statusFields.includes("friction") ||
    statusFields.includes("drift") ||
    statusFields.includes("at-risk") ||
    statusFields.includes("atrisk") ||
    description.includes("friction") ||
    description.includes("blocked") ||
    description.includes("manual")
  );
}

function emitWorkflowFabric(items: WorkflowItem[]): void {
  for (const item of items) {
    const description = extractWorkflowText(item);

    try {
      const pc2Record = buildWorkflowPc2Record(description);
      console.debug("[workflowStore][PC2]", pc2Record);
    } catch (error) {
      console.warn("[workflowStore][PC2] failed", error);
    }

    if (shouldEmitFact2(item)) {
      try {
        const fact2Record = buildWorkflowFact2Record(description);
        console.debug("[workflowStore][FACT2]", fact2Record);
      } catch (error) {
        console.warn("[workflowStore][FACT2] failed", error);
      }
    }
  }
}

export function listWorkflowItems(): WorkflowItem[] {
  return safeRead().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function saveWorkflowItems(items: WorkflowItem[]): WorkflowItem[] {
  safeWrite(items);
  emitWorkflowFabric(items);
  return items;
}

export function clearWorkflowItems(): void {
  if (typeof window === "undefined") return;

  try {
    const fact2Record = buildWorkflowFact2Record("workflow items cleared");
    console.debug("[workflowStore][FACT2][clear]", fact2Record);
  } catch (error) {
    console.warn("[workflowStore][FACT2][clear] failed", error);
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
