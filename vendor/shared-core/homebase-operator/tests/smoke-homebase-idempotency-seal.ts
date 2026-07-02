import * as fs from "node:fs";
import * as path from "node:path";
import * as crypto from "node:crypto";
import { fingerprintSignal, runHomebaseExecutor } from "../homebaseExecutor.ts";

const ROOT = "D:\\DEV\\AIVA";
const HOMEBASE = path.join(ROOT, "homebase");
const QUEUE = path.join(HOMEBASE, "EXECUTION_QUEUE");
const LIVE = path.join(HOMEBASE, "LIVE_RECORD");
const DENIED = path.join(HOMEBASE, "EXECUTION_DENIED");
const EXECUTED = path.join(HOMEBASE, "EXECUTED");
const INDEX = path.join(HOMEBASE, "INDEX");
const EXECUTOR = path.join(ROOT, "shared-core", "homebase-operator", "homebaseExecutor.ts");

function ensureDir(dir: string): void { fs.mkdirSync(dir, { recursive: true }); }
function assert(condition: boolean, message: string): void { if (!condition) throw new Error(message); }
function write(file: string, text: string): void { fs.writeFileSync(file, text, "utf8"); }
function readAllFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).map((name) => path.join(dir, name)).filter((file) => fs.statSync(file).isFile());
}
function cleanByBatch(batch: string): void {
  for (const dir of [QUEUE, LIVE, DENIED, EXECUTED, INDEX]) {
    ensureDir(dir);
    for (const file of readAllFiles(dir)) {
      const raw = fs.readFileSync(file, "utf8");
      if (file.includes(batch) || raw.includes(batch)) fs.unlinkSync(file);
    }
  }
}
function countFilesContaining(dir: string, text: string): number {
  return readAllFiles(dir).filter((file) => fs.readFileSync(file, "utf8").includes(text)).length;
}

for (const dir of [QUEUE, LIVE, DENIED, EXECUTED, INDEX]) ensureDir(dir);

const batch = `HB_SOS_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
cleanByBatch(batch);

const signal = `---
execution_id: volatile-one
executed_at: volatile-date
route: volatile-route
source_file: volatile-source
manifest_id: volatile-manifest
live_record_id: volatile-live
---
SIGNAL_KIND: ALLOW
BATCH: ${batch}
ACTION: CREATE_LIVE_SYSTEM_RECORD
PAYLOAD: EXECUTION IDEMPOTENCY SEAL TEST
`;

const duplicateWrappedSignal = `---
execution_id: volatile-two
executed_at: volatile-date-two
route: different-route
source_file: different-source
manifest_id: different-manifest
live_record_id: different-live
---
SIGNAL_KIND: ALLOW
BATCH: ${batch}
ACTION: CREATE_LIVE_SYSTEM_RECORD
PAYLOAD: EXECUTION IDEMPOTENCY SEAL TEST
`;

const paccLockSignal = `
SIGNAL_KIND: ALLOW
BATCH: ${batch}
PACC LOCK
ACTION: SHOULD_BE_DENIED
`;

write(path.join(QUEUE, `${batch}-allow-a.md`), signal);
write(path.join(QUEUE, `${batch}-allow-b.md`), duplicateWrappedSignal);
write(path.join(QUEUE, `${batch}-pacc-lock.md`), paccLockSignal);

assert(fingerprintSignal(signal) === fingerprintSignal(duplicateWrappedSignal), "Fingerprint must ignore volatile wrappers.");

const results = runHomebaseExecutor({ homebaseRoot: HOMEBASE });
const batchResults = results.filter((r) => fs.readFileSync(r.sourceFile, "utf8").includes(batch));

assert(batchResults.filter((r) => r.status === "EXECUTED").length === 1, "Expected one EXECUTED.");
assert(batchResults.filter((r) => r.status === "DENIED" && r.reason === "IDEMPOTENCY_DUPLICATE_LIVE_SIGNAL").length === 1, "Expected one duplicate DENIED.");
assert(batchResults.filter((r) => r.status === "DENIED" && r.reason === "PACC_LOCK_DENIED").length === 1, "Expected one PACC LOCK DENIED.");
assert(countFilesContaining(LIVE, batch) === 1, "Duplicate signal created more than one Live System Record.");
assert(countFilesContaining(EXECUTED, batch) === 1, "Expected one executed record.");

const executorSource = fs.readFileSync(EXECUTOR, "utf8");
assert(executorSource.includes("runHomebaseQueueTruth"), "Watcher chain missing runHomebaseQueueTruth.");
assert(executorSource.includes("runGatedAutoRouter"), "Watcher chain missing runGatedAutoRouter.");
assert(executorSource.includes("D:\\\\DEV\\\\AIVA\\\\homebase"), "Executor does not default to real Homebase path.");

console.log("HB-SOS_EXECUTION_IDEMPOTENCY_SEAL=PASS");
console.log("one EXECUTED");
console.log("one DENIED | IDEMPOTENCY_DUPLICATE_LIVE_SIGNAL");
console.log("PACC_LOCK_DENIED=PASS");
console.log("LIVE_RECORD_DUPLICATE_PREVENTION=PASS");
console.log("WATCHER_CHAIN_VERIFIED=PASS");
console.log("REAL_HOMEBASE_PATH_VERIFIED=D:\\DEV\\AIVA\\homebase");