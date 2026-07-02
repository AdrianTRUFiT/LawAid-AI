import fs from 'fs';
import crypto from 'crypto';

const PRIMARY = 'D:/DEV/AIVA/shared-data/truth-ledger/ledger.jsonl';
const MIRROR  = 'D:/DEV/AIVA/shared-data/truth-ledger-mirror/ledger.jsonl';

function hash(data: any) {
  return crypto.createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

function fail(reason: string, index: number) {
  console.error("? TAMPER DETECTED");
  console.error("Reason:", reason);
  console.error("At record index:", index);
  process.exit(1);
}

function load(path: string): string[] {
  if (!fs.existsSync(path)) return [];
  return fs.readFileSync(path, 'utf-8')
    .split('\n')
    .filter(Boolean);
}

export function verifyLedger() {

  const primaryLines = load(PRIMARY);
  const mirrorLines  = load(MIRROR);

  if (primaryLines.length !== mirrorLines.length) {
    fail("LEDGER_LENGTH_MISMATCH", -1);
  }

  let prevHash = "GENESIS";

  for (let i = 0; i < primaryLines.length; i++) {

    const p = JSON.parse(primaryLines[i]);
    const m = JSON.parse(mirrorLines[i]);

    // ?? CROSS-SOURCE HASH MATCH
    if (p.hash !== m.hash) {
      fail("LEDGER_DIVERGENCE", i);
    }

    const { hash: storedHash, ...withoutHash } = p;

    // ?? CHAIN LINK
    if (p.prevHash !== prevHash) {
      fail("BROKEN_CHAIN_LINK", i);
    }

    // ?? HASH VALIDATION
    const computedHash = hash(withoutHash);
    if (computedHash !== storedHash) {
      fail("HASH_MISMATCH", i);
    }

    prevHash = storedHash;
  }

  console.log("? DUAL-LEDGER VERIFIED — NO TAMPERING");
  console.log("Records:", primaryLines.length);
}

verifyLedger();
