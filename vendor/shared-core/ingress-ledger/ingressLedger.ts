import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { persistIngress, resolvePersistedHeld } from '../ingress-persistence/ingressPersistence';
import { IngressInput } from '../ingress-gate/ingressGate';

const ledgerDir = "D:/DEV/AIVA/shared-data/ingress-ledger";
const ledgerPath = path.join(ledgerDir, "ingress-ledger.jsonl");

export type IngressLedgerAction =
  | "INGRESS_PERSISTED"
  | "HELD_RESOLVED"
  | "HELD_RESOLUTION_FAILED"
  | "REFUSAL_RECORDED";

export type IngressLedgerEntry = {
  ledgerId: string;
  action: IngressLedgerAction;
  recordId: string;
  state: string;
  reason: string;
  timestamp: number;
  prevHash: string;
  hash: string;
};

function ensureLedger() {
  fs.mkdirSync(ledgerDir, { recursive: true });
  if (!fs.existsSync(ledgerPath)) {
    fs.writeFileSync(ledgerPath, "", "utf8");
  }
}

function sha(input: any) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function readEntries(): IngressLedgerEntry[] {
  ensureLedger();

  const raw = fs.readFileSync(ledgerPath, "utf8").trim();
  if (!raw) return [];

  return raw
    .split("\n")
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

function getLastHash() {
  const entries = readEntries();
  if (entries.length === 0) return "GENESIS";
  return entries[entries.length - 1].hash;
}

export function appendIngressLedger(input: {
  action: IngressLedgerAction;
  recordId: string;
  state: string;
  reason: string;
}) {
  ensureLedger();

  const timestamp = Date.now();
  const prevHash = getLastHash();

  const payload = {
    action: input.action,
    recordId: input.recordId,
    state: input.state,
    reason: input.reason,
    timestamp,
    prevHash
  };

  const hash = sha(payload);

  const entry: IngressLedgerEntry = {
    ledgerId: "INGLED-" + hash.slice(0, 14),
    ...payload,
    hash
  };

  fs.appendFileSync(ledgerPath, JSON.stringify(entry) + "\n", "utf8");

  return entry;
}

export function persistIngressWithLedger(input: IngressInput) {
  const record = persistIngress(input);

  const action =
    record.state === "REFUSED"
      ? "REFUSAL_RECORDED"
      : "INGRESS_PERSISTED";

  const ledger = appendIngressLedger({
    action,
    recordId: record.recordId,
    state: record.state,
    reason: record.packet.reason
  });

  return { record, ledger };
}

export function resolveHeldWithLedger(recordId: string, patch: Partial<IngressInput>) {
  const result = resolvePersistedHeld(recordId, patch);

  if (result.status === "RESOLVED") {
    const ledger = appendIngressLedger({
      action: "HELD_RESOLVED",
      recordId,
      state: "RESOLVED",
      reason: result.record.packet.reason
    });

    return { ...result, ledger };
  }

  const ledger = appendIngressLedger({
    action: "HELD_RESOLUTION_FAILED",
    recordId,
    state: result.status,
    reason: result.reason || result.result?.secondPass?.reason || "HELD_RESOLUTION_FAILED"
  });

  return { ...result, ledger };
}

export function verifyIngressLedger() {
  const entries = readEntries();

  let prevHash = "GENESIS";

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    const payload = {
      action: entry.action,
      recordId: entry.recordId,
      state: entry.state,
      reason: entry.reason,
      timestamp: entry.timestamp,
      prevHash: entry.prevHash
    };

    const expectedHash = sha(payload);

    if (entry.prevHash !== prevHash) {
      return {
        verified: false,
        index: i,
        reason: "PREV_HASH_MISMATCH",
        expectedPrevHash: prevHash,
        actualPrevHash: entry.prevHash
      };
    }

    if (entry.hash !== expectedHash) {
      return {
        verified: false,
        index: i,
        reason: "HASH_MISMATCH",
        expectedHash,
        actualHash: entry.hash
      };
    }

    prevHash = entry.hash;
  }

  return {
    verified: true,
    entries: entries.length,
    lastHash: prevHash
  };
}

export function getIngressLedgerEntries() {
  return readEntries();
}
