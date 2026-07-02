import {
  enforceSoulVaultSoulBaseBoundary,
  evaluateSoulMemoryGovernance
} from "../memory-boundary";
import type {
  FundTrackerAIToSoulBaseMemoryProjection,
  FinancialMemoryProjectionRequest,
  Stage2ProjectionGateDecision
} from "./stage2Contracts";

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function nowIso(): string {
  return new Date().toISOString();
}

export function evaluateFundTrackerToSoulBaseProjection(
  request: FinancialMemoryProjectionRequest
): Stage2ProjectionGateDecision {
  const refusalReasons: string[] = [];
  const requiredCorrections: string[] = [];

  if (!hasText(request.requestId)) {
    refusalReasons.push("REQUEST_ID_MISSING");
    requiredCorrections.push("Provide requestId.");
  }

  if (request.stage2ExplicitlyAuthorized !== true) {
    refusalReasons.push("STAGE_2_NOT_EXPLICITLY_AUTHORIZED");
    requiredCorrections.push("Explicitly authorize Stage 2 before creating projection.");
  }

  const ats = request.activatedTransactionState;

  if (!ats || !hasText(ats.activatedTransactionStateId)) {
    refusalReasons.push("ACTIVATED_TRANSACTION_STATE_ID_MISSING");
    requiredCorrections.push("Provide Activated Transaction State ID.");
  }

  if (!ats || ats.sourceAuthority !== "FundTrackerAI") {
    refusalReasons.push("SOURCE_AUTHORITY_MUST_BE_FUNDTRACKERAI");
    requiredCorrections.push("Projection must originate from FundTrackerAI.");
  }

  if (!ats || ats.status !== "ACTIVATED") {
    refusalReasons.push("ACTIVATED_TRANSACTION_STATE_REQUIRED");
    requiredCorrections.push("Only ACTIVATED transaction state may emit memory projection.");
  }

  if (!ats || ats.verifiedCommitment !== true) {
    refusalReasons.push("VERIFIED_COMMITMENT_REQUIRED");
    requiredCorrections.push("Commitment truth requires FundTrackerAI verification.");
  }

  if (!ats || !hasText(ats.transactionProofRef)) {
    refusalReasons.push("TRANSACTION_PROOF_REF_REQUIRED");
    requiredCorrections.push("Provide transaction proof reference.");
  }

  if (!ats || ats.entitlementState !== "ENTITLED") {
    refusalReasons.push("ENTITLEMENT_STATE_MUST_BE_ENTITLED");
    requiredCorrections.push("Only entitled transaction state may emit memory projection.");
  }

  if (!hasText(request.ledgerSafeSummary)) {
    refusalReasons.push("LEDGER_SAFE_SUMMARY_REQUIRED");
    requiredCorrections.push("Provide a redacted ledger-safe summary.");
  }

  if (!hasText(request.continuityPattern)) {
    refusalReasons.push("CONTINUITY_PATTERN_REQUIRED");
    requiredCorrections.push("Provide continuity-safe financial pattern.");
  }

  if (!hasText(request.userContainerScope)) {
    refusalReasons.push("USER_CONTAINER_SCOPE_REQUIRED");
    requiredCorrections.push("Bind projection to user/container scope.");
  }

  if (!hasText(request.downstreamConsumerId)) {
    refusalReasons.push("DOWNSTREAM_CONSUMER_ID_REQUIRED");
    requiredCorrections.push("Provide downstream consumer permission target.");
  }

  if (!request.custodyClass) {
    refusalReasons.push("CUSTODY_CLASS_REQUIRED");
    requiredCorrections.push("Assign custody class before projection.");
  }

  if (!request.redactionLevel) {
    refusalReasons.push("REDACTION_LEVEL_REQUIRED");
    requiredCorrections.push("Assign redaction level before projection.");
  }

  if (!request.retentionRule) {
    refusalReasons.push("RETENTION_RULE_REQUIRED");
    requiredCorrections.push("Assign retention rule before projection.");
  }

  if (request.processorEventTreatedAsTruth) {
    refusalReasons.push("PROCESSOR_EVENT_CANNOT_BE_TREATED_AS_TRUTH");
    requiredCorrections.push("Processor event must be transformed by FundTrackerAI into Activated Transaction State.");
  }

  if (request.containsRawProcessorObject) {
    refusalReasons.push("RAW_PROCESSOR_OBJECT_CANNOT_CROSS");
    requiredCorrections.push("Remove raw processor object before projection.");
  }

  if (request.containsRawBankStatement) {
    refusalReasons.push("RAW_BANK_STATEMENT_CANNOT_CROSS");
    requiredCorrections.push("Route raw bank statement to SoulVault? custody.");
  }

  if (request.containsFullAccountNumber) {
    refusalReasons.push("FULL_ACCOUNT_NUMBER_CANNOT_CROSS");
    requiredCorrections.push("Remove full account number before projection.");
  }

  if (request.containsUnredactedPaymentMethod) {
    refusalReasons.push("UNREDACTED_PAYMENT_METHOD_CANNOT_CROSS");
    requiredCorrections.push("Redact payment method before projection.");
  }

  if (request.containsPrivateSourceDocument) {
    refusalReasons.push("PRIVATE_SOURCE_DOCUMENT_REQUIRES_CUSTODY");
    requiredCorrections.push("Route private source document to SoulVault? custody.");
  }

  if (request.containsLegalEvidenceFile) {
    refusalReasons.push("LEGAL_EVIDENCE_FILE_REQUIRES_CUSTODY");
    requiredCorrections.push("Route legal evidence file to SoulVault? custody.");
  }

  if (request.containsUnrestrictedFinancialHistory) {
    refusalReasons.push("UNRESTRICTED_FINANCIAL_HISTORY_CANNOT_CROSS");
    requiredCorrections.push("Create bounded, redacted, purpose-limited projection only.");
  }

  let custodyBoundaryPassed = false;
  let soulMemoryGovernancePassed = false;

  if (
    request.custodyClass &&
    request.redactionLevel &&
    request.retentionRule &&
    hasText(request.userContainerScope) &&
    hasText(request.downstreamConsumerId)
  ) {
    const custodyDecision = enforceSoulVaultSoulBaseBoundary({
      candidateId: request.requestId,
      label: request.ledgerSafeSummary ?? "Financial memory projection",
      custodyClass: request.custodyClass,
      redactionLevel: request.redactionLevel,
      retentionRule: request.retentionRule,
      requestedDestination: "SOULBASE_AI",
      sourceSystem: "FundTrackerAI",
      authorization: request.authorization
    });

    custodyBoundaryPassed = custodyDecision.canPersistToSoulBaseAI === true;

    if (!custodyBoundaryPassed) {
      refusalReasons.push(...custodyDecision.refusalReasons);
      requiredCorrections.push(...custodyDecision.requiredCorrections);
    }

    const governanceDecision = evaluateSoulMemoryGovernance({
      projectionId: request.requestId,
      projectionLabel: request.ledgerSafeSummary ?? "Financial memory projection",
      isDerived: true,
      isRedacted: request.redactionLevel === "SUMMARY_ONLY" || request.redactionLevel === "REDACTED",
      isRetentionBounded:
        request.retentionRule === "CONTAINER_BOUND" ||
        request.retentionRule === "USER_APPROVED_CONTINUITY",
      hasUserContainerScope: hasText(request.userContainerScope),
      hasDownstreamConsumerPermission:
        request.authorization.downstreamConsumerPermission === true &&
        hasText(request.downstreamConsumerId),
      containsRawSourceData:
        request.containsPrivateSourceDocument ||
        request.containsRawBankStatement ||
        request.containsLegalEvidenceFile,
      containsRawFinancialSource: request.containsRawBankStatement,
      containsLegalEvidenceFile: request.containsLegalEvidenceFile,
      containsProcessorObject: request.containsRawProcessorObject
    });

    soulMemoryGovernancePassed = governanceDecision.canPersistToSoulBaseAI === true;

    if (!soulMemoryGovernancePassed) {
      refusalReasons.push(...governanceDecision.refusalReasons);
      requiredCorrections.push(...governanceDecision.requiredCorrections);
    }
  }

  const uniqueRefusals = Array.from(new Set(refusalReasons));
  const uniqueCorrections = Array.from(new Set(requiredCorrections));

  const canEmitProjection = uniqueRefusals.length === 0;

  const projection: FundTrackerAIToSoulBaseMemoryProjection | undefined = canEmitProjection &&
    request.custodyClass &&
    request.redactionLevel &&
    request.retentionRule &&
    request.ledgerSafeSummary &&
    request.continuityPattern &&
    request.userContainerScope &&
    request.downstreamConsumerId
    ? {
        artifactType: "FundTrackerAIToSoulBaseMemoryProjection",
        projectionId: `projection_${request.activatedTransactionState.activatedTransactionStateId}`,
        sourceAuthority: "FundTrackerAI",
        destination: "SoulBaseAI",
        activatedTransactionStateId: request.activatedTransactionState.activatedTransactionStateId,
        transactionProofRef: request.activatedTransactionState.transactionProofRef,
        entitlementState: request.activatedTransactionState.entitlementState,
        ledgerSafeSummary: request.ledgerSafeSummary,
        continuityPattern: request.continuityPattern,
        merchantContinuityRef: request.activatedTransactionState.merchantContinuityRef,
        custodyClass: request.custodyClass,
        redactionLevel: request.redactionLevel,
        retentionRule: request.retentionRule,
        userContainerScope: request.userContainerScope,
        downstreamConsumerId: request.downstreamConsumerId,
        createdAt: nowIso(),
        boundary: {
          projectionIsNotTransactionTruth: true,
          projectionIsNotPaymentAuthority: true,
          projectionIsNotEntitlementAuthority: true,
          projectionIsNotCustodyTransfer: true,
          projectionDoesNotContainRawProcessorObject: true,
          projectionDoesNotContainRawBankStatement: true,
          projectionDoesNotContainFullAccountNumber: true,
          projectionDoesNotContainUnredactedPaymentMethod: true,
          fundTrackerAIRemainsFinancialTruth: true,
          soulBaseAIRemainsMemorySubstrate: true,
          soulVaultRemainsCustodyPlane: true,
          soulMemoryGovernsPersistence: true,
          defaultPostureIsDeny: true
        }
      }
    : undefined;

  const decision = canEmitProjection
    ? "EMIT_MEMORY_PROJECTION"
    : request.containsRawBankStatement ||
        request.containsPrivateSourceDocument ||
        request.containsLegalEvidenceFile
      ? "REQUIRE_SOULVAULT_CUSTODY"
      : "REFUSE_PROJECTION";

  return {
    requestId: request.requestId,
    status: canEmitProjection
      ? "FUNDTRACKER_SOULBASE_PROJECTION_READY"
      : "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED",
    decision,
    canEmitProjection,
    projection,
    refusalReasons: uniqueRefusals,
    requiredCorrections: uniqueCorrections,
    authorityTrace: {
      stage2ExplicitlyAuthorized: request.stage2ExplicitlyAuthorized,
      fundTrackerAIProvidedActivatedTransactionState:
        request.activatedTransactionState?.sourceAuthority === "FundTrackerAI",
      activatedTransactionStateVerified:
        request.activatedTransactionState?.status === "ACTIVATED" &&
        request.activatedTransactionState?.verifiedCommitment === true,
      custodyBoundaryPassed,
      soulMemoryGovernancePassed,
      processorEventRejectedAsTruth: request.processorEventTreatedAsTruth !== true
    },
    boundary: {
      paymentEventIsNotCommitmentTruth: true,
      commitmentTruthRequiresFundTrackerAI: true,
      rawProcessorObjectCannotCross: true,
      rawBankDataCannotCross: true,
      privateSourceDataRemainsCustody: true,
      soulBaseAIIsNotFinancialTruth: true,
      soulBaseAIIsNotPaymentAuthority: true,
      soulVaultRemainsCustodyPlane: true,
      fundTrackerAIRemainsTransactionTruth: true,
      stage2ContractIsProjectionOnly: true
    }
  };
}




