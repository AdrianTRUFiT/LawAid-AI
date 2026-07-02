declare const require: any;

import {
  buildProjectionLedgerFilePaths,
  verifyProjectionLedgerFiles
} from "./projectionLedgerFileStore";

const fs = require("fs");

function getProcessArgv(): string[] {
  const maybeProcess = (globalThis as unknown as { process?: { argv?: string[] } }).process;
  return Array.isArray(maybeProcess?.argv) ? maybeProcess.argv : [];
}

async function main() {
  const args: string[] = getProcessArgv();
  const rootArgIndex = args.indexOf("--root");

  const rootDir: string =
    rootArgIndex >= 0 && typeof args[rootArgIndex + 1] === "string"
      ? args[rootArgIndex + 1]!
      : "D:/DEV/AIVA/shared-data/projection-ledger-file";

  const paths = buildProjectionLedgerFilePaths(rootDir);
  const result = await verifyProjectionLedgerFiles(paths);

  fs.writeFileSync(paths.recoveryReportFile, JSON.stringify(result.recoveryReport, null, 2), "utf8");

  console.log("PROJECTION_LEDGER_FILE_VERIFY_STATUS");
  console.log(result.status);
  console.log("VERIFIED");
  console.log(result.verified);
  console.log("PROJECTION_COUNT");
  console.log(result.projectionCount);
  console.log("LEDGER_ENTRY_COUNT");
  console.log(result.ledgerEntryCount);
  console.log("RECOVERY_REPORT");
  console.log(paths.recoveryReportFile);

  if (!result.verified) {
    throw new Error("PROJECTION_LEDGER_FILE_VERIFICATION_FAILED");
  }
}

main().catch((error) => {
  throw error;
});


