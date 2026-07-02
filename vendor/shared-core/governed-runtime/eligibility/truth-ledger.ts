import fs from 'fs';
import crypto from 'crypto';

const PRIMARY = 'D:/DEV/AIVA/shared-data/truth-ledger/ledger.jsonl';
const MIRROR  = 'D:/DEV/AIVA/shared-data/truth-ledger-mirror/ledger.jsonl';

function hash(data: any) {
  return crypto.createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

function getLastHash(path: string): string {
  if (!fs.existsSync(path)) return "GENESIS";
  const lines = fs.readFileSync(path, 'utf-8').trim().split('\n');
  if (lines.length === 0) return "GENESIS";
  const last = JSON.parse(lines[lines.length - 1]);
  return last.hash;
}

function append(path: string, record: any) {
  fs.appendFileSync(path, JSON.stringify(record) + '\n');
}

export function appendLedger(entry: any) {

  const prevHashPrimary = getLastHash(PRIMARY);
  const prevHashMirror  = getLastHash(MIRROR);

  if (prevHashPrimary !== prevHashMirror) {
    throw new Error("LEDGER_DIVERGENCE_DETECTED_PRE_WRITE");
  }

  const baseRecord = {
    ...entry,
    prevHash: prevHashPrimary,
    timestamp: Date.now()
  };

  const recordHash = hash(baseRecord);

  const final = {
    ...baseRecord,
    hash: recordHash
  };

  try {
    append(PRIMARY, final);
    append(MIRROR, final);
  } catch (err) {
    throw new Error("DUAL_WRITE_FAILURE");
  }

  const verifyPrimary = getLastHash(PRIMARY);
  const verifyMirror  = getLastHash(MIRROR);

  if (verifyPrimary !== verifyMirror) {
    throw new Error("POST_WRITE_DIVERGENCE");
  }
}
