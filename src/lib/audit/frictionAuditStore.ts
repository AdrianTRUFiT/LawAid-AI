export type FrictionSeverity = "low" | "medium" | "high";
export type FrictionCategory =
  | "structural"
  | "workflow"
  | "missing-artifact"
  | "visibility"
  | "automation"
  | "manual-safety"
  | "continuity"
  | "retrieval"
  | "operator-burden";

export interface FrictionAuditEntry {
  id: string;
  createdAt: string;
  title: string;
  description: string;
  category: FrictionCategory;
  severity: FrictionSeverity;
  stageContext: "step7" | "step8" | "step9" | "step10" | "live-use";
  status: "open" | "reviewed" | "planned" | "resolved";
}

const STORAGE_KEY = "lawaidai-friction-audit";

function safeRead(): FrictionAuditEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FrictionAuditEntry[];
  } catch {
    return [];
  }
}

function safeWrite(items: FrictionAuditEntry[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function makeId(): string {
  return `friction-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function listFrictionAuditEntries(): FrictionAuditEntry[] {
  return safeRead().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addFrictionAuditEntry(
  input: Omit<FrictionAuditEntry, "id" | "createdAt">,
): FrictionAuditEntry {
  const next: FrictionAuditEntry = {
    id: makeId(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  const existing = safeRead();
  safeWrite([next, ...existing]);
  return next;
}

export function updateFrictionAuditStatus(
  id: string,
  status: FrictionAuditEntry["status"],
): FrictionAuditEntry[] {
  const items = safeRead().map((entry) =>
    entry.id === id ? { ...entry, status } : entry,
  );
  safeWrite(items);
  return items;
}

export function exportFrictionAudit(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      entries: listFrictionAuditEntries(),
    },
    null,
    2,
  );
}

export function clearFrictionAudit(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
