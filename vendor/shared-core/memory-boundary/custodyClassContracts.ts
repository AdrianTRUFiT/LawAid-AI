export type CustodyClass =
  | "CLOUD_SAFE_METADATA"
  | "RESTRICTED_CONTEXTUAL_DATA"
  | "DERIVED_MEMORY_PROJECTION"
  | "LEDGER_SAFE_SUMMARY"
  | "PRIVATE_SOURCE_DATA"
  | "RAW_FINANCIAL_SOURCE"
  | "RAW_PROCESSOR_OBJECT"
  | "LEGAL_EVIDENCE_FILE"
  | "UNRESTRICTED_FINANCIAL_HISTORY";

export type RedactionLevel =
  | "NONE_REQUIRED"
  | "SUMMARY_ONLY"
  | "REDACTED"
  | "FINGERPRINT_ONLY"
  | "SOURCE_LOCKED";

export type RetentionRule =
  | "SESSION_ONLY"
  | "USER_APPROVED_CONTINUITY"
  | "CONTAINER_BOUND"
  | "SOURCE_CUSTODY_ONLY"
  | "DO_NOT_PERSIST";

export type MemoryDestination =
  | "SOULBASE_AI"
  | "SOULVAULT"
  | "REFUSE";

export type EnforcementStatus =
  | "MEMORY_PROJECTION_ALLOWED"
  | "CUSTODY_REQUIRED"
  | "REFUSED_BY_DEFAULT_DENY";

export interface CustodyAuthorization {
  userContainerAuthorized: boolean;
  downstreamConsumerPermission: boolean;
  retentionApproved: boolean;
  redactionConfirmed: boolean;
}

export interface MemoryBoundaryCandidate {
  candidateId: string;
  label: string;
  custodyClass: CustodyClass;
  redactionLevel: RedactionLevel;
  retentionRule: RetentionRule;
  requestedDestination: MemoryDestination;
  authorization: CustodyAuthorization;
  sourceSystem: "FundTrackerAI" | "SoulVault?" | "ThinkBaseAI" | "ManualReview" | "Unknown";
}

export interface EnforcementDecision {
  candidateId: string;
  status: EnforcementStatus;
  approvedDestination: MemoryDestination;
  canPersistToSoulBaseAI: boolean;
  mustRemainInSoulVault: boolean;
  refusalReasons: string[];
  requiredCorrections: string[];
  boundary: {
    defaultPostureIsDeny: true;
    memoryIsDerived: true;
    custodyIsOriginal: true;
    soulBaseAIIsNotTransactionTruth: true;
    soulBaseAIIsNotPaymentAuthority: true;
    soulBaseAIDoesNotOwnRawBankData: true;
    soulVaultOwnsPrivateSourceCustody: true;
    fundTrackerAIRemainsFinancialTruth: true;
  };
}






