import type { EnforcementDecision, MemoryBoundaryCandidate } from "./custodyClassContracts";
import { getCustodyClassDefinition } from "./custodyClassTaxonomy";

function allAuthorizationPresent(candidate: MemoryBoundaryCandidate): boolean {
  return (
    candidate.authorization.userContainerAuthorized === true &&
    candidate.authorization.downstreamConsumerPermission === true &&
    candidate.authorization.retentionApproved === true &&
    candidate.authorization.redactionConfirmed === true
  );
}

export function enforceSoulVaultSoulBaseBoundary(
  candidate: MemoryBoundaryCandidate
): EnforcementDecision {
  const definition = getCustodyClassDefinition(candidate.custodyClass);
  const refusalReasons: string[] = [];
  const requiredCorrections: string[] = [];

  if (!candidate.candidateId || candidate.candidateId.trim().length === 0) {
    refusalReasons.push("CANDIDATE_ID_MISSING");
    requiredCorrections.push("Provide candidateId.");
  }

  if (!candidate.label || candidate.label.trim().length === 0) {
    refusalReasons.push("LABEL_MISSING");
    requiredCorrections.push("Provide label.");
  }

  if (candidate.requestedDestination === "SOULBASE_AI" && definition.allowedSoulBaseAI !== true) {
    refusalReasons.push("SOULBASE_AI_NOT_ALLOWED_FOR_CUSTODY_CLASS");
    requiredCorrections.push("Route source material to SoulVault? custody or create a derived memory projection.");
  }

  if (candidate.redactionLevel !== definition.requiredRedactionLevel) {
    refusalReasons.push("REDACTION_LEVEL_MISMATCH");
    requiredCorrections.push(`Required redaction level: ${definition.requiredRedactionLevel}.`);
  }

  if (candidate.retentionRule !== definition.requiredRetentionRule) {
    refusalReasons.push("RETENTION_RULE_MISMATCH");
    requiredCorrections.push(`Required retention rule: ${definition.requiredRetentionRule}.`);
  }

  if (definition.allowedSoulBaseAI === true && !allAuthorizationPresent(candidate)) {
    refusalReasons.push("AUTHORIZATION_INCOMPLETE");
    requiredCorrections.push("Confirm user/container authorization, downstream permission, retention approval, and redaction.");
  }

  if (candidate.custodyClass === "RAW_PROCESSOR_OBJECT") {
    refusalReasons.push("RAW_PROCESSOR_OBJECT_CANNOT_CROSS");
    requiredCorrections.push("FundTrackerAI must transform processor event into governed financial truth before any memory projection exists.");
  }

  if (candidate.custodyClass === "UNRESTRICTED_FINANCIAL_HISTORY") {
    refusalReasons.push("UNRESTRICTED_FINANCIAL_HISTORY_CANNOT_CROSS");
    requiredCorrections.push("Create bounded, redacted, purpose-limited summary before any memory projection is considered.");
  }

  const canPersistToSoulBaseAI =
    refusalReasons.length === 0 &&
    definition.allowedSoulBaseAI === true &&
    candidate.requestedDestination === "SOULBASE_AI";

  const mustRemainInSoulVault =
    definition.defaultDestination === "SOULVAULT" ||
    candidate.custodyClass === "PRIVATE_SOURCE_DATA" ||
    candidate.custodyClass === "RAW_FINANCIAL_SOURCE" ||
    candidate.custodyClass === "LEGAL_EVIDENCE_FILE";

  const approvedDestination = canPersistToSoulBaseAI
    ? "SOULBASE_AI"
    : mustRemainInSoulVault
      ? "SOULVAULT"
      : "REFUSE";

  const status = canPersistToSoulBaseAI
    ? "MEMORY_PROJECTION_ALLOWED"
    : mustRemainInSoulVault
      ? "CUSTODY_REQUIRED"
      : "REFUSED_BY_DEFAULT_DENY";

  return {
    candidateId: candidate.candidateId,
    status,
    approvedDestination,
    canPersistToSoulBaseAI,
    mustRemainInSoulVault,
    refusalReasons,
    requiredCorrections,
    boundary: {
      defaultPostureIsDeny: true,
      memoryIsDerived: true,
      custodyIsOriginal: true,
      soulBaseAIIsNotTransactionTruth: true,
      soulBaseAIIsNotPaymentAuthority: true,
      soulBaseAIDoesNotOwnRawBankData: true,
      soulVaultOwnsPrivateSourceCustody: true,
      fundTrackerAIRemainsFinancialTruth: true
    }
  };
}






