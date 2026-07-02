import type { FundTrackerAIToSoulBaseMemoryProjection } from "../fundtracker-soulbase-contract";

export type ProjectionLedgerStatus =
  | "PROJECTION_LEDGER_ENTRY_ACCEPTED"
  | "PROJECTION_LEDGER_ENTRY_REFUSED";

export type ProjectionPersistenceStatus =
  | "PROJECTION_PERSISTENCE_ACCEPTED"
  | "PROJECTION_PERSISTENCE_REFUSED";

export type LedgerVerificationStatus =
  | "PROJECTION_LEDGER_VERIFIED"
  | "PROJECTION_LEDGER_TAMPER_DETECTED";

export type ProjectionRefusalCode =
  | "PROJECTION_MISSING"
  | "PROJECTION_ID_MISSING"
  | "DUPLICATE_PROJECTION_REFUSED"
  | "SOURCE_AUTHORITY_INVALID"
  | "DESTINATION_INVALID"
  | "ARTIFACT_TYPE_INVALID"
  | "BOUNDARY_FLAG_INVALID"
  | "PROJECTION_HASH_MISMATCH"
  | "ENTRY_HASH_MISMATCH"
  | "PREV_HASH_MISMATCH"
  | "SEQUENCE_MISMATCH"
  | "LEDGER_EMPTY"
  | "DOWNSTREAM_CONSUMER_MISMATCH";

export interface ProjectionLedgerEntry {
  entryId: string;
  sequence: number;
  projectionId: string;
  activatedTransactionStateId: string;
  artifactType: "FundTrackerAIToSoulBaseMemoryProjection";
  sourceAuthority: "FundTrackerAI";
  destination: "SoulBaseAI";
  downstreamConsumerId: string;
  projectionHash: string;
  prevHash: string;
  entryHash: string;
  createdAt: string;
  boundary: {
    entryIsNotPaymentAuthority: true;
    entryIsNotTransactionTruth: true;
    entryIsNotCustodyTransfer: true;
    entryIsTamperAware: true;
    replayRefusalRequired: true;
    fundTrackerAIRemainsTransactionTruth: true;
    soulBaseAIRemainsMemorySubstrate: true;
    soulVaultRemainsCustodyPlane: true;
  };
}

export interface ProjectionLedgerAppendDecision {
  status: ProjectionLedgerStatus;
  accepted: boolean;
  entry?: ProjectionLedgerEntry;
  refusalReasons: ProjectionRefusalCode[];
  requiredCorrections: string[];
  boundary: {
    paymentAuthorityNotCreated: true;
    custodyTransferNotCreated: true;
    duplicateProjectionRefused: boolean;
    tamperAwareLedgerMaintained: true;
  };
}

export interface ProjectionLedgerVerificationResult {
  status: LedgerVerificationStatus;
  verified: boolean;
  refusalReasons: ProjectionRefusalCode[];
  inspectedEntries: number;
  lastValidHash?: string;
}

export interface ProjectionPersistenceRequest {
  projection: FundTrackerAIToSoulBaseMemoryProjection;
  ledger: ProjectionLedgerEntry[];
  downstreamConsumerId: string;
}

export interface ProjectionPersistenceDecision {
  status: ProjectionPersistenceStatus;
  persisted: boolean;
  record?: {
    projectionId: string;
    ledgerEntryId: string;
    projectionHash: string;
    entryHash: string;
    destination: "SoulBaseAI";
    downstreamConsumerId: string;
    persistenceClass: "AUTHORIZED_MEMORY_PROJECTION";
  };
  ledgerDecision: ProjectionLedgerAppendDecision;
  downstreamReadiness: DownstreamConsumerReadiness;
  boundary: {
    persistenceIsNotPaymentAuthority: true;
    persistenceIsNotTransactionTruth: true;
    persistenceIsNotCustodyTransfer: true;
    persistenceIsNotRuntimeActivation: true;
    sourceTruthRemainsFundTrackerAI: true;
    sourceCustodyRemainsSoulVault: true;
  };
}

export interface DownstreamConsumerReadiness {
  consumerId: string;
  ready: boolean;
  allowedToReadProjection: boolean;
  allowedToReadRawSource: false;
  allowedToModifyLedger: false;
  allowedToCreateEntitlement: false;
  allowedToCreatePaymentAuthority: false;
  boundary: {
    displayIsNotAuthority: true;
    memoryIsNotTransactionTruth: true;
    ledgerIsTamperAwareRecordOnly: true;
  };
}



