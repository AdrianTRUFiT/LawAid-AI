import type {
  SoulMemoryGovernanceDecision,
  SoulMemoryGovernanceInput
} from "./soulMemoryGovernanceContracts";

export function evaluateSoulMemoryGovernance(
  input: SoulMemoryGovernanceInput
): SoulMemoryGovernanceDecision {
  const refusalReasons: string[] = [];
  const requiredCorrections: string[] = [];

  if (!input.projectionId || input.projectionId.trim().length === 0) {
    refusalReasons.push("PROJECTION_ID_MISSING");
    requiredCorrections.push("Provide projectionId.");
  }

  if (!input.projectionLabel || input.projectionLabel.trim().length === 0) {
    refusalReasons.push("PROJECTION_LABEL_MISSING");
    requiredCorrections.push("Provide projectionLabel.");
  }

  if (!input.isDerived) {
    refusalReasons.push("MEMORY_MUST_BE_DERIVED");
    requiredCorrections.push("Create a derived memory projection before SoulBaseAI persistence.");
  }

  if (!input.isRedacted) {
    refusalReasons.push("MEMORY_MUST_BE_REDACTED");
    requiredCorrections.push("Redact the projection before SoulBaseAI persistence.");
  }

  if (!input.isRetentionBounded) {
    refusalReasons.push("RETENTION_BOUNDARY_REQUIRED");
    requiredCorrections.push("Apply a retention rule before SoulBaseAI persistence.");
  }

  if (!input.hasUserContainerScope) {
    refusalReasons.push("USER_CONTAINER_SCOPE_REQUIRED");
    requiredCorrections.push("Bind projection to user/container scope.");
  }

  if (!input.hasDownstreamConsumerPermission) {
    refusalReasons.push("DOWNSTREAM_PERMISSION_REQUIRED");
    requiredCorrections.push("Confirm downstream consumer permission.");
  }

  if (input.containsRawSourceData) {
    refusalReasons.push("RAW_SOURCE_DATA_REQUIRES_CUSTODY");
    requiredCorrections.push("Route raw source data to SoulVault? custody.");
  }

  if (input.containsRawFinancialSource) {
    refusalReasons.push("RAW_FINANCIAL_SOURCE_REQUIRES_CUSTODY");
    requiredCorrections.push("Route raw financial source to SoulVault? custody.");
  }

  if (input.containsLegalEvidenceFile) {
    refusalReasons.push("LEGAL_EVIDENCE_FILE_REQUIRES_CUSTODY");
    requiredCorrections.push("Route legal evidence file to SoulVault? custody.");
  }

  if (input.containsProcessorObject) {
    refusalReasons.push("PROCESSOR_OBJECT_CANNOT_PERSIST_AS_MEMORY");
    requiredCorrections.push("FundTrackerAI must transform processor object into governed financial truth before memory projection.");
  }

  const sourceCustodyRequired =
    input.containsRawSourceData ||
    input.containsRawFinancialSource ||
    input.containsLegalEvidenceFile;

  const canPersistToSoulBaseAI = refusalReasons.length === 0;

  const decision = canPersistToSoulBaseAI
    ? "ALLOW_MEMORY_PROJECTION"
    : sourceCustodyRequired
      ? "REQUIRE_SOULVAULT_CUSTODY"
      : "REFUSE_PERSISTENCE";

  return {
    projectionId: input.projectionId,
    status: canPersistToSoulBaseAI
      ? "SOULMEMORY_GOVERNS_SOULBASEAI_READY"
      : "SOULMEMORY_GOVERNS_SOULBASEAI_BLOCKED",
    decision,
    canPersistToSoulBaseAI,
    requiresSoulVaultCustody: sourceCustodyRequired,
    refusalReasons,
    requiredCorrections,
    governanceLine:
      "SoulMemory? governs what SoulBaseAI may persist: only derived, redacted, retention-bounded, user-scoped, permissioned memory projections.",
    boundary: {
      soulMemoryIsDoctrine: true,
      soulMemoryIsNotRuntimeStore: true,
      soulMemoryGovernsPersistence: true,
      soulBaseAIReceivesOnlyPermittedMemory: true,
      soulVaultKeepsSourceCustody: true,
      defaultPostureIsDeny: true
    }
  };
}





