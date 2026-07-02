import fs from "node:fs";
import path from "node:path";

export type PrivacyActionType =
  | "redact"
  | "delete"
  | "freeze"
  | "manual_review"
  | "export_subject_access"
  | "retention_sweep";

export interface PrivacyActionReceipt {
  receiptId: string;
  actionType: PrivacyActionType;
  artifactType?: string;
  transactionId?: string;
  subjectId?: string;
  status: "completed" | "queued" | "blocked";
  reason?: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

export interface PrivacyApprovalItem {
  approvalId: string;
  actionType: PrivacyActionType;
  artifactType: string;
  transactionId?: string;
  subjectId?: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  reason: string;
  payload: Record<string, unknown>;
}

export interface ChargebackHoldRecord {
  holdId: string;
  transactionId: string;
  artifactType?: string;
  createdAt: string;
  reason: string;
  status: "active" | "released";
}

const dataDir = path.resolve(process.cwd(), "records", "privacy");
const receiptFile = path.join(dataDir, "action-receipts.json");
const approvalFile = path.join(dataDir, "approval-queue.json");
const holdFile = path.join(dataDir, "chargeback-holds.json");

function ensureStore(): void {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(receiptFile)) {
    fs.writeFileSync(receiptFile, JSON.stringify([], null, 2), "utf8");
  }
  if (!fs.existsSync(approvalFile)) {
    fs.writeFileSync(approvalFile, JSON.stringify([], null, 2), "utf8");
  }
  if (!fs.existsSync(holdFile)) {
    fs.writeFileSync(holdFile, JSON.stringify([], null, 2), "utf8");
  }
}

function nowIso(): string {
  return new Date().toISOString();
}

function buildId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function readJsonFile<T>(filepath: string): T {
  ensureStore();
  return JSON.parse(fs.readFileSync(filepath, "utf8")) as T;
}

function writeJsonFile<T>(filepath: string, payload: T): void {
  ensureStore();
  fs.writeFileSync(filepath, JSON.stringify(payload, null, 2), "utf8");
}

export function getPrivacyActionReceipts(): PrivacyActionReceipt[] {
  return readJsonFile<PrivacyActionReceipt[]>(receiptFile);
}

export function resetPrivacyActionReceipts(): void {
  writeJsonFile(receiptFile, []);
}

export function recordPrivacyActionReceipt(
  input: Omit<PrivacyActionReceipt, "receiptId" | "createdAt">,
): PrivacyActionReceipt {
  const receipts = getPrivacyActionReceipts();
  const receipt: PrivacyActionReceipt = {
    receiptId: buildId("receipt"),
    createdAt: nowIso(),
    ...input,
  };
  receipts.push(receipt);
  writeJsonFile(receiptFile, receipts);
  return receipt;
}

export function getPrivacyApprovalQueue(): PrivacyApprovalItem[] {
  return readJsonFile<PrivacyApprovalItem[]>(approvalFile);
}

export function resetPrivacyApprovalQueue(): void {
  writeJsonFile(approvalFile, []);
}

export function queuePrivacyApproval(
  input: Omit<PrivacyApprovalItem, "approvalId" | "requestedAt" | "status">,
): PrivacyApprovalItem {
  const items = getPrivacyApprovalQueue();
  const item: PrivacyApprovalItem = {
    approvalId: buildId("approval"),
    requestedAt: nowIso(),
    status: "pending",
    ...input,
  };
  items.push(item);
  writeJsonFile(approvalFile, items);
  return item;
}

export function updatePrivacyApprovalStatus(
  approvalId: string,
  status: "approved" | "rejected",
): PrivacyApprovalItem | null {
  const items = getPrivacyApprovalQueue();
  const item = items.find((entry) => entry.approvalId === approvalId);
  if (!item) {
    return null;
  }
  item.status = status;
  writeJsonFile(approvalFile, items);
  return item;
}

export function getChargebackHolds(): ChargebackHoldRecord[] {
  return readJsonFile<ChargebackHoldRecord[]>(holdFile);
}

export function resetChargebackHolds(): void {
  writeJsonFile(holdFile, []);
}

export function createChargebackHold(
  transactionId: string,
  reason: string,
  artifactType?: string,
): ChargebackHoldRecord {
  const holds = getChargebackHolds();
  const hold: ChargebackHoldRecord = {
    holdId: buildId("hold"),
    transactionId,
    artifactType,
    createdAt: nowIso(),
    reason,
    status: "active",
  };
  holds.push(hold);
  writeJsonFile(holdFile, holds);
  return hold;
}

export function releaseChargebackHold(holdId: string): ChargebackHoldRecord | null {
  const holds = getChargebackHolds();
  const hold = holds.find((entry) => entry.holdId === holdId);
  if (!hold) {
    return null;
  }
  hold.status = "released";
  writeJsonFile(holdFile, holds);
  return hold;
}

export function hasActiveChargebackHold(
  transactionId?: string,
  artifactType?: string,
): boolean {
  if (!transactionId) {
    return false;
  }

  return getChargebackHolds().some((hold) => {
    if (hold.status !== "active") {
      return false;
    }
    if (hold.transactionId !== transactionId) {
      return false;
    }
    if (!artifactType || !hold.artifactType) {
      return true;
    }
    return hold.artifactType === artifactType;
  });
}

export function buildPrivacyDashboardSnapshot() {
  const receipts = getPrivacyActionReceipts();
  const approvals = getPrivacyApprovalQueue();
  const holds = getChargebackHolds();

  return {
    receiptCount: receipts.length,
    completedReceiptCount: receipts.filter((item) => item.status === "completed").length,
    blockedReceiptCount: receipts.filter((item) => item.status === "blocked").length,
    queuedReceiptCount: receipts.filter((item) => item.status === "queued").length,
    approvalPendingCount: approvals.filter((item) => item.status === "pending").length,
    approvalApprovedCount: approvals.filter((item) => item.status === "approved").length,
    approvalRejectedCount: approvals.filter((item) => item.status === "rejected").length,
    activeChargebackHoldCount: holds.filter((item) => item.status === "active").length,
    releasedChargebackHoldCount: holds.filter((item) => item.status === "released").length,
  };
}
