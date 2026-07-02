import type { FundTrackerAIToSoulBaseMemoryProjection } from "../fundtracker-soulbase-contract";
import type {
  ProjectionLedgerAppendDecision,
  ProjectionLedgerEntry,
  ProjectionLedgerVerificationResult,
  ProjectionPersistenceDecision
} from "../projection-ledger";

export type ProjectionLedgerFileWriteStatus =
  | "PROJECTION_FILE_LEDGER_WRITE_ACCEPTED"
  | "PROJECTION_FILE_LEDGER_WRITE_REFUSED";

export type ProjectionLedgerFileVerifyStatus =
  | "PROJECTION_FILE_LEDGER_VERIFIED"
  | "PROJECTION_FILE_LEDGER_REFUSED";

export type ProjectionLedgerFileRefusalCode =
  | "PROJECTION_FILE_LEDGER_PATH_MISSING"
  | "PROJECTION_FILE_LEDGER_PARSE_FAILED"
  | "PROJECTION_FILE_LEDGER_TAMPER_DETECTED"
  | "PROJECTION_FILE_LEDGER_REPLAY_REFUSED"
  | "PROJECTION_FILE_LEDGER_WRITE_FAILED"
  | "PROJECTION_FILE_LEDGER_DOWNSTREAM_REFUSED"
  | "PROJECTION_FILE_LEDGER_NO_ENTRY_CREATED"
  | "PROJECTION_FILE_LEDGER_PROJECTION_MISSING"
  | "PROJECTION_FILE_LEDGER_NO_PAYMENT_AUTHORITY";

export interface ProjectionLedgerFilePaths {
  rootDir: string;
  projectionFile: string;
  ledgerFile: string;
  recoveryReportFile: string;
}

export interface ProjectionLedgerFileWriteRequest {
  projection: FundTrackerAIToSoulBaseMemoryProjection;
  paths: ProjectionLedgerFilePaths;
  downstreamConsumerId: string;
}

export interface ProjectionLedgerFileWriteDecision {
  status: ProjectionLedgerFileWriteStatus;
  accepted: boolean;
  projectionWritten: boolean;
  ledgerEntryWritten: boolean;
  persistenceDecision?: ProjectionPersistenceDecision;
  ledgerEntry?: ProjectionLedgerEntry;
  refusalReasons: ProjectionLedgerFileRefusalCode[];
  requiredCorrections: string[];
  paths: ProjectionLedgerFilePaths;
  boundary: {
    appendOnlyWritePath: true;
    fileLedgerIsNotPaymentAuthority: true;
    fileLedgerIsNotTransactionTruth: true;
    fileLedgerIsNotCustodyTransfer: true;
    fileLedgerIsNotRuntimeActivation: true;
    sourceTruthRemainsFundTrackerAI: true;
    sourceCustodyRemainsSoulVault: true;
  };
}

export interface ProjectionLedgerFileVerifyDecision {
  status: ProjectionLedgerFileVerifyStatus;
  verified: boolean;
  ledgerVerification: ProjectionLedgerVerificationResult;
  projectionCount: number;
  ledgerEntryCount: number;
  refusalReasons: ProjectionLedgerFileRefusalCode[];
  paths: ProjectionLedgerFilePaths;
  recoveryReport?: ProjectionLedgerRecoveryReport;
  boundary: {
    verifierIsReadOnly: true;
    verifierCreatesNoPaymentAuthority: true;
    verifierCreatesNoCustodyTransfer: true;
    verifierCreatesNoRuntimeActivation: true;
  };
}

export interface ProjectionLedgerRecoveryReport {
  status: "RECOVERY_REPORT_READY";
  inspectedAt: string;
  projectionCount: number;
  ledgerEntryCount: number;
  verified: boolean;
  refusalReasons: string[];
  lastValidHash?: string;
  recommendedAction: string;
  boundary: {
    recoveryReportIsNotRepair: true;
    recoveryReportIsNotAuthority: true;
    humanReviewRequiredForRepair: true;
  };
}


