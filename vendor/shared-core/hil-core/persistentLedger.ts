import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ledgerDir = "D:/DEV/AIVA/shared-data/hil-ledger";
const ledgerPath = path.join(ledgerDir, "hil_ledger.jsonl");

function sha(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

function ensureLedger() {
  fs.mkdirSync(ledgerDir, { recursive: true });
  if (!fs.existsSync(ledgerPath)) {
    fs.writeFileSync(ledgerPath, "", "utf8");
  }
}

function getLastHash() {
  ensureLedger();
  const lines = fs.readFileSync(ledgerPath, "utf8").trim().split("\n").filter(Boolean);
  if (lines.length === 0) return "GENESIS";
  const last = JSON.parse(lines[lines.length - 1]);
  return last.hash;
}

export function appendPersistentLedger(input: {
  eventId: string;
  artifactId: string;
  type: string;
  module: string;
  fee: number;
}) {
  ensureLedger();

  const prevHash = getLastHash();
  const timestamp = Date.now();

  const payload = {
    eventId: input.eventId,
    artifactId: input.artifactId,
    type: input.type,
    module: input.module,
    fee: input.fee,
    timestamp,
    prevHash
  };

  const hash = sha(JSON.stringify(payload));

  const entry = {
    ...payload,
    hash
  };

  fs.appendFileSync(ledgerPath, JSON.stringify(entry) + "\n", "utf8");

  return entry;
}

export function verifyPersistentLedger() {
  ensureLedger();

  const lines = fs.readFileSync(ledgerPath, "utf8").trim().split("\n").filter(Boolean);
  let prevHash = "GENESIS";

  for (let i = 0; i < lines.length; i++) {
    const entry = JSON.parse(lines[i]);

    const payload = {
      eventId: entry.eventId,
      artifactId: entry.artifactId,
      type: entry.type,
      module: entry.module,
      fee: entry.fee,
      timestamp: entry.timestamp,
      prevHash: entry.prevHash
    };

    const recomputed = sha(JSON.stringify(payload));

    if (entry.prevHash !== prevHash) {
      return { verified: false, index: i, reason: "PREV_HASH_MISMATCH" };
    }

    if (entry.hash !== recomputed) {
      return { verified: false, index: i, reason: "HASH_MISMATCH" };
    }

    prevHash = entry.hash;
  }

  return { verified: true, entries: lines.length };
}
