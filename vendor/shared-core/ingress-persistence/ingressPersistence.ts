import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { evaluateIngress, IngressInput, IngressPacket } from '../ingress-gate/ingressGate';
import { resolveHeldIngress } from '../held-resolution/heldResolutionEngine';

const queueDir = "D:/DEV/AIVA/shared-data/ingress-queue";

export type PersistedIngressState = "ACCEPTED" | "HELD" | "REFUSED" | "RESOLVED";

export type PersistedIngressRecord = {
  recordId: string;
  state: PersistedIngressState;
  originalInput: IngressInput;
  packet: IngressPacket;
  createdAt: number;
  updatedAt: number;
  history: {
    action: string;
    timestamp: number;
    reason: string;
  }[];
};

function ensureStore() {
  fs.mkdirSync(queueDir, { recursive: true });
}

function sha(input: any) {
  return crypto.createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function fileFor(recordId: string) {
  return path.join(queueDir, recordId + ".json");
}

export function persistIngress(input: IngressInput): PersistedIngressRecord {
  ensureStore();

  const packet = evaluateIngress(input);
  const now = Date.now();

  const recordId = "INGREC-" + sha({
    input,
    packet,
    now
  }).slice(0, 14);

  const record: PersistedIngressRecord = {
    recordId,
    state: packet.decision,
    originalInput: input,
    packet,
    createdAt: now,
    updatedAt: now,
    history: [
      {
        action: "INGRESS_EVALUATED",
        timestamp: now,
        reason: packet.reason
      }
    ]
  };

  fs.writeFileSync(fileFor(recordId), JSON.stringify(record, null, 2), "utf8");

  return record;
}

export function getIngressRecord(recordId: string): PersistedIngressRecord | null {
  ensureStore();

  const file = fileFor(recordId);
  if (!fs.existsSync(file)) return null;

  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function listIngressRecords() {
  ensureStore();

  return fs.readdirSync(queueDir)
    .filter(f => f.endsWith(".json"))
    .map(f => JSON.parse(fs.readFileSync(path.join(queueDir, f), "utf8")));
}

export function listIngressByState(state: PersistedIngressState) {
  return listIngressRecords().filter(r => r.state === state);
}

export function resolvePersistedHeld(recordId: string, patch: Partial<IngressInput>) {
  const record = getIngressRecord(recordId);

  if (!record) {
    return {
      status: "REFUSED",
      reason: "INGRESS_RECORD_NOT_FOUND"
    };
  }

  if (record.state !== "HELD") {
    return {
      status: "REFUSED",
      reason: "ONLY_HELD_RECORDS_CAN_BE_RESOLVED",
      record
    };
  }

  const result = resolveHeldIngress({
    originalInput: record.originalInput,
    patch
  });

  const now = Date.now();

  if (result.status === "HELD_RESOLVED") {
    record.state = "RESOLVED";
    record.packet = result.secondPass;
    record.updatedAt = now;
    record.history.push({
      action: "HELD_RESOLVED",
      timestamp: now,
      reason: result.secondPass.reason
    });

    fs.writeFileSync(fileFor(recordId), JSON.stringify(record, null, 2), "utf8");

    return {
      status: "RESOLVED",
      record,
      result
    };
  }

  record.updatedAt = now;
  record.history.push({
    action: "HELD_RESOLUTION_FAILED",
    timestamp: now,
    reason: result.secondPass?.reason || "HELD_NOT_RESOLVED"
  });

  fs.writeFileSync(fileFor(recordId), JSON.stringify(record, null, 2), "utf8");

  return {
    status: "HELD_NOT_RESOLVED",
    record,
    result
  };
}
