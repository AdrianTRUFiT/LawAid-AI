export type SoulMemoryGovernanceStatus =
  | "SOULMEMORY_GOVERNS_SOULBASEAI_READY"
  | "SOULMEMORY_GOVERNS_SOULBASEAI_BLOCKED";

export type PersistenceDecision =
  | "ALLOW_MEMORY_PROJECTION"
  | "REQUIRE_SOULVAULT_CUSTODY"
  | "REFUSE_PERSISTENCE";

export interface SoulMemoryGovernanceInput {
  projectionId: string;
  projectionLabel: string;
  isDerived: boolean;
  isRedacted: boolean;
  isRetentionBounded: boolean;
  hasUserContainerScope: boolean;
  hasDownstreamConsumerPermission: boolean;
  containsRawSourceData: boolean;
  containsRawFinancialSource: boolean;
  containsLegalEvidenceFile: boolean;
  containsProcessorObject: boolean;
}

export interface SoulMemoryGovernanceDecision {
  projectionId: string;
  status: SoulMemoryGovernanceStatus;
  decision: PersistenceDecision;
  canPersistToSoulBaseAI: boolean;
  requiresSoulVaultCustody: boolean;
  refusalReasons: string[];
  requiredCorrections: string[];
  governanceLine: string;
  boundary: {
    soulMemoryIsDoctrine: true;
    soulMemoryIsNotRuntimeStore: true;
    soulMemoryGovernsPersistence: true;
    soulBaseAIReceivesOnlyPermittedMemory: true;
    soulVaultKeepsSourceCustody: true;
    defaultPostureIsDeny: true;
  };
}





