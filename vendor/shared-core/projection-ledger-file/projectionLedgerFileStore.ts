declare const require: any;

import type { FundTrackerAIToSoulBaseMemoryProjection } from "../fundtracker-soulbase-contract";
import {
  persistProjectionForSoulBaseAI,
  verifyProjectionLedger
} from "../projection-ledger";
import type {
  ProjectionLedgerEntry
} from "../projection-ledger";
import type {
  ProjectionLedgerFilePaths,
  ProjectionLedgerFileRefusalCode,
  ProjectionLedgerFileVerifyDecision,
  ProjectionLedgerFileWriteDecision,
  ProjectionLedgerFileWriteRequest,
  ProjectionLedgerRecoveryReport
} from "./projectionLedgerFileContracts";

const fs = require("fs");
const path = require("path");

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true });
}

function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

function readJsonl<T>(filePath: string): { ok: true; records: T[] } | { ok: false; error: string } {
  if (!fileExists(filePath)) {
    return { ok: true, records: [] };
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 0);

  const records: T[] = [];

  try {
    for (const line of lines) {
      records.push(JSON.parse(line) as T);
    }

    return { ok: true, records };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

function appendJsonl(filePath: string, value: unknown): void {
  fs.appendFileSync(filePath, JSON.stringify(value) + "\n", "utf8");
}

export function buildProjectionLedgerFilePaths(rootDir: string): ProjectionLedgerFilePaths {
  return {
    rootDir,
    projectionFile: path.join(rootDir, "projection-records.jsonl"),
    ledgerFile: path.join(rootDir, "projection-ledger.jsonl"),
    recoveryReportFile: path.join(rootDir, "projection-ledger-recovery-report.json")
  };
}

export function loadProjectionRecords(
  paths: ProjectionLedgerFilePaths
): { ok: true; projections: FundTrackerAIToSoulBaseMemoryProjection[] } | { ok: false; error: string } {
  const loaded = readJsonl<FundTrackerAIToSoulBaseMemoryProjection>(paths.projectionFile);

  if (!loaded.ok) {
    return { ok: false, error: loaded.error };
  }

  return { ok: true, projections: loaded.records };
}

export function loadLedgerEntries(
  paths: ProjectionLedgerFilePaths
): { ok: true; entries: ProjectionLedgerEntry[] } | { ok: false; error: string } {
  const loaded = readJsonl<ProjectionLedgerEntry>(paths.ledgerFile);

  if (!loaded.ok) {
    return { ok: false, error: loaded.error };
  }

  return { ok: true, entries: loaded.records };
}

function buildProjectionLookup(
  projections: FundTrackerAIToSoulBaseMemoryProjection[]
): Record<string, FundTrackerAIToSoulBaseMemoryProjection> {
  const lookup: Record<string, FundTrackerAIToSoulBaseMemoryProjection> = {};

  for (const projection of projections) {
    lookup[projection.projectionId] = projection;
  }

  return lookup;
}

export async function writeProjectionToFileLedger(
  request: ProjectionLedgerFileWriteRequest
): Promise<ProjectionLedgerFileWriteDecision> {
  ensureDir(request.paths.rootDir);

  const refusalReasons: ProjectionLedgerFileRefusalCode[] = [];
  const requiredCorrections: string[] = [];

  const projectionLoad = loadProjectionRecords(request.paths);
  const ledgerLoad = loadLedgerEntries(request.paths);

  if (!projectionLoad.ok) {
    refusalReasons.push("PROJECTION_FILE_LEDGER_PARSE_FAILED");
    requiredCorrections.push("Repair projection JSONL before appending.");
  }

  if (!ledgerLoad.ok) {
    refusalReasons.push("PROJECTION_FILE_LEDGER_PARSE_FAILED");
    requiredCorrections.push("Repair ledger JSONL before appending.");
  }

  if (refusalReasons.length > 0 || !projectionLoad.ok || !ledgerLoad.ok) {
    return {
      status: "PROJECTION_FILE_LEDGER_WRITE_REFUSED",
      accepted: false,
      projectionWritten: false,
      ledgerEntryWritten: false,
      refusalReasons: Array.from(new Set(refusalReasons)),
      requiredCorrections: Array.from(new Set(requiredCorrections)),
      paths: request.paths,
      boundary: {
        appendOnlyWritePath: true,
        fileLedgerIsNotPaymentAuthority: true,
        fileLedgerIsNotTransactionTruth: true,
        fileLedgerIsNotCustodyTransfer: true,
        fileLedgerIsNotRuntimeActivation: true,
        sourceTruthRemainsFundTrackerAI: true,
        sourceCustodyRemainsSoulVault: true
      }
    };
  }

  const duplicateProjection = ledgerLoad.entries.some(
    (entry) => entry.projectionId === request.projection.projectionId
  );

  if (duplicateProjection) {
    return {
      status: "PROJECTION_FILE_LEDGER_WRITE_REFUSED",
      accepted: false,
      projectionWritten: false,
      ledgerEntryWritten: false,
      refusalReasons: ["PROJECTION_FILE_LEDGER_REPLAY_REFUSED"],
      requiredCorrections: ["Do not append duplicate projection to file ledger."],
      paths: request.paths,
      boundary: {
        appendOnlyWritePath: true,
        fileLedgerIsNotPaymentAuthority: true,
        fileLedgerIsNotTransactionTruth: true,
        fileLedgerIsNotCustodyTransfer: true,
        fileLedgerIsNotRuntimeActivation: true,
        sourceTruthRemainsFundTrackerAI: true,
        sourceCustodyRemainsSoulVault: true
      }
    };
  }

  const persistenceDecision = await persistProjectionForSoulBaseAI({
    projection: request.projection,
    ledger: ledgerLoad.entries,
    downstreamConsumerId: request.downstreamConsumerId
  });

  if (!persistenceDecision.persisted || !persistenceDecision.ledgerDecision.entry) {
    return {
      status: "PROJECTION_FILE_LEDGER_WRITE_REFUSED",
      accepted: false,
      projectionWritten: false,
      ledgerEntryWritten: false,
      persistenceDecision,
      refusalReasons: ["PROJECTION_FILE_LEDGER_DOWNSTREAM_REFUSED", "PROJECTION_FILE_LEDGER_NO_ENTRY_CREATED"],
      requiredCorrections: [
        "Verify downstream readiness and projection ledger acceptance before writing."
      ],
      paths: request.paths,
      boundary: {
        appendOnlyWritePath: true,
        fileLedgerIsNotPaymentAuthority: true,
        fileLedgerIsNotTransactionTruth: true,
        fileLedgerIsNotCustodyTransfer: true,
        fileLedgerIsNotRuntimeActivation: true,
        sourceTruthRemainsFundTrackerAI: true,
        sourceCustodyRemainsSoulVault: true
      }
    };
  }

  try {
    appendJsonl(request.paths.projectionFile, request.projection);
    appendJsonl(request.paths.ledgerFile, persistenceDecision.ledgerDecision.entry);
  } catch (error) {
    return {
      status: "PROJECTION_FILE_LEDGER_WRITE_REFUSED",
      accepted: false,
      projectionWritten: false,
      ledgerEntryWritten: false,
      persistenceDecision,
      refusalReasons: ["PROJECTION_FILE_LEDGER_WRITE_FAILED"],
      requiredCorrections: [
        error instanceof Error ? error.message : String(error)
      ],
      paths: request.paths,
      boundary: {
        appendOnlyWritePath: true,
        fileLedgerIsNotPaymentAuthority: true,
        fileLedgerIsNotTransactionTruth: true,
        fileLedgerIsNotCustodyTransfer: true,
        fileLedgerIsNotRuntimeActivation: true,
        sourceTruthRemainsFundTrackerAI: true,
        sourceCustodyRemainsSoulVault: true
      }
    };
  }

  return {
    status: "PROJECTION_FILE_LEDGER_WRITE_ACCEPTED",
    accepted: true,
    projectionWritten: true,
    ledgerEntryWritten: true,
    persistenceDecision,
    ledgerEntry: persistenceDecision.ledgerDecision.entry,
    refusalReasons: [],
    requiredCorrections: [],
    paths: request.paths,
    boundary: {
      appendOnlyWritePath: true,
      fileLedgerIsNotPaymentAuthority: true,
      fileLedgerIsNotTransactionTruth: true,
      fileLedgerIsNotCustodyTransfer: true,
      fileLedgerIsNotRuntimeActivation: true,
      sourceTruthRemainsFundTrackerAI: true,
      sourceCustodyRemainsSoulVault: true
    }
  };
}

export async function verifyProjectionLedgerFiles(
  paths: ProjectionLedgerFilePaths
): Promise<ProjectionLedgerFileVerifyDecision> {
  ensureDir(paths.rootDir);

  const refusalReasons: ProjectionLedgerFileRefusalCode[] = [];

  const projectionLoad = loadProjectionRecords(paths);
  const ledgerLoad = loadLedgerEntries(paths);

  if (!projectionLoad.ok || !ledgerLoad.ok) {
    const recoveryReport: ProjectionLedgerRecoveryReport = {
      status: "RECOVERY_REPORT_READY",
      inspectedAt: new Date().toISOString(),
      projectionCount: 0,
      ledgerEntryCount: 0,
      verified: false,
      refusalReasons: ["PROJECTION_FILE_LEDGER_PARSE_FAILED"],
      recommendedAction: "Stop writes. Restore from last verified ledger snapshot or submit for human review.",
      boundary: {
        recoveryReportIsNotRepair: true,
        recoveryReportIsNotAuthority: true,
        humanReviewRequiredForRepair: true
      }
    };

    fs.writeFileSync(paths.recoveryReportFile, JSON.stringify(recoveryReport, null, 2), "utf8");

    return {
      status: "PROJECTION_FILE_LEDGER_REFUSED",
      verified: false,
      ledgerVerification: {
        status: "PROJECTION_LEDGER_TAMPER_DETECTED",
        verified: false,
        refusalReasons: [],
        inspectedEntries: 0
      },
      projectionCount: 0,
      ledgerEntryCount: 0,
      refusalReasons: ["PROJECTION_FILE_LEDGER_PARSE_FAILED"],
      paths,
      recoveryReport,
      boundary: {
        verifierIsReadOnly: true,
        verifierCreatesNoPaymentAuthority: true,
        verifierCreatesNoCustodyTransfer: true,
        verifierCreatesNoRuntimeActivation: true
      }
    };
  }

  const lookup = buildProjectionLookup(projectionLoad.projections);
  const ledgerVerification = await verifyProjectionLedger(ledgerLoad.entries, lookup);

  if (!ledgerVerification.verified) {
    refusalReasons.push("PROJECTION_FILE_LEDGER_TAMPER_DETECTED");
  }

  const verified = ledgerVerification.verified === true;
  const recoveryReport: ProjectionLedgerRecoveryReport = {
    status: "RECOVERY_REPORT_READY",
    inspectedAt: new Date().toISOString(),
    projectionCount: projectionLoad.projections.length,
    ledgerEntryCount: ledgerLoad.entries.length,
    verified,
    refusalReasons: ledgerVerification.refusalReasons,
    lastValidHash: ledgerVerification.lastValidHash,
    recommendedAction: verified
      ? "No recovery required. Ledger chain verifies."
      : "Stop writes. Preserve corrupted files, compare against last verified packet, and require human review before repair.",
    boundary: {
      recoveryReportIsNotRepair: true,
      recoveryReportIsNotAuthority: true,
      humanReviewRequiredForRepair: true
    }
  };

  fs.writeFileSync(paths.recoveryReportFile, JSON.stringify(recoveryReport, null, 2), "utf8");

  return {
    status: verified ? "PROJECTION_FILE_LEDGER_VERIFIED" : "PROJECTION_FILE_LEDGER_REFUSED",
    verified,
    ledgerVerification,
    projectionCount: projectionLoad.projections.length,
    ledgerEntryCount: ledgerLoad.entries.length,
    refusalReasons,
    paths,
    recoveryReport,
    boundary: {
      verifierIsReadOnly: true,
      verifierCreatesNoPaymentAuthority: true,
      verifierCreatesNoCustodyTransfer: true,
      verifierCreatesNoRuntimeActivation: true
    }
  };
}


