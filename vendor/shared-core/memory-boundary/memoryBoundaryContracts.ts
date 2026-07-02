export type MemoryBoundaryStatus =
  | "THINKBASE_SOULBASE_BOUNDARY_VERIFICATION_READY"
  | "THINKBASE_SOULBASE_BOUNDARY_VERIFICATION_BLOCKED";

export type BoundaryLayerKey =
  | "THINKBASE_AI"
  | "SOULBASE_AI"
  | "SOULVAULT"
  | "SOULMEMORY"
  | "SOULMARK";

export type DefaultCrossingPosture = "DENY";

export interface BoundaryLayerDefinition {
  key: BoundaryLayerKey;
  displayName: string;
  role: string;
  does: string[];
  mustNotDo: string[];
  oneLineLock: string;
  canonicalStatus: "VERIFIED" | "PRE_CANONICAL";
}

export interface BoundaryGap {
  id: string;
  title: string;
  description: string;
  blocksStage2: boolean;
}

export interface FinancialMemoryCrossingRule {
  mayPersistAsFinancialMemory: string[];
  mustRemainPrivateSourceData: string[];
  allowedDerivedSummary: string;
  requiresAuthorization: string[];
  cannotCrossByDefault: string[];
}

export interface MemoryBoundaryVerificationResult {
  status: MemoryBoundaryStatus;
  preCanonical: boolean;
  stage2Blocked: boolean;
  defaultCrossingPosture: DefaultCrossingPosture;
  layerDefinitions: BoundaryLayerDefinition[];
  financialMemoryCrossingRule: FinancialMemoryCrossingRule;
  mustConfirm: string[];
  mustRefuse: string[];
  gaps: BoundaryGap[];
  nextAuthorizedStep: string;
  governingLaw: string;
  boundary: {
    thinkBaseDoesNotOwnTruth: true;
    soulBaseDoesNotBecomeTransactionTruth: true;
    soulBaseDoesNotBecomePaymentAuthority: true;
    soulBaseDoesNotOwnRawBankDataByDefault: true;
    soulBaseDoesNotReplaceSoulVaultCustody: true;
    soulBaseDoesNotOverrideFundTrackerAI: true;
    soulBaseDoesNotOverrideUserAuthorization: true;
    soulMemoryGovernsPersistenceRules: true;
    soulMarkDoesNotStoreOrOwnCustody: true;
    defaultPostureIsDeny: true;
  };
}







