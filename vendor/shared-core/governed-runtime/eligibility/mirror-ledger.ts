import fs from 'fs';

const PRIMARY = 'D:/DEV/AIVA/shared-data/truth-ledger/ledger.jsonl';
const MIRROR  = 'D:/DEV/AIVA/shared-data/truth-ledger-mirror/ledger.jsonl';

export function mirrorLedger() {
  if (!fs.existsSync(PRIMARY)) return;

  const data = fs.readFileSync(PRIMARY, 'utf-8');
  fs.writeFileSync(MIRROR, data);
}

mirrorLedger();
