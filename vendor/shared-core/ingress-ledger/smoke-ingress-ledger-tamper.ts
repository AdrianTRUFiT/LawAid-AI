import fs from 'fs';
import { verifyIngressLedger } from './ingressLedger';

const ledgerPath = "D:/DEV/AIVA/shared-data/ingress-ledger/ingress-ledger.jsonl";
const backupPath = "D:/DEV/AIVA/shared-data/ingress-ledger/ingress-ledger.backup.jsonl";

function restore() {
  fs.copyFileSync(backupPath, ledgerPath);
}

function tamperFirstEntry() {
  const lines = fs.readFileSync(ledgerPath, "utf8").trim().split("\n").filter(Boolean);
  const first = JSON.parse(lines[0]);

  first.reason = "TAMPERED_REASON";

  lines[0] = JSON.stringify(first);
  fs.writeFileSync(ledgerPath, lines.join("\n") + "\n", "utf8");
}

console.log("INGRESS_LEDGER_TAMPER_TEST=START");

const before = verifyIngressLedger();

tamperFirstEntry();

const afterTamper = verifyIngressLedger();

restore();

const afterRestore = verifyIngressLedger();

console.log("----");
console.log("BEFORE_TAMPER");
console.log(JSON.stringify(before, null, 2));

console.log("----");
console.log("AFTER_TAMPER");
console.log(JSON.stringify(afterTamper, null, 2));

console.log("----");
console.log("AFTER_RESTORE");
console.log(JSON.stringify(afterRestore, null, 2));

console.log("---- VERIFICATION ----");

const beforeOk =
  before.verified === true;

const tamperDetectedOk =
  afterTamper.verified === false &&
  afterTamper.reason === "HASH_MISMATCH";

const restoreOk =
  afterRestore.verified === true;

console.log({
  beforeOk,
  tamperDetectedOk,
  restoreOk
});

if (!beforeOk || !tamperDetectedOk || !restoreOk) {
  restore();
  throw new Error("INGRESS_LEDGER_TAMPER_TEST_FAILED");
}

console.log("INGRESS_LEDGER_TAMPER_TEST=PASS");
console.log("INGRESS_LEDGER_TAMPER_TEST=COMPLETE");
