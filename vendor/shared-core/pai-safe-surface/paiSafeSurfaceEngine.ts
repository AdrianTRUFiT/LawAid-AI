import type {
  FinTechionOversightProjection,
  FundTrackerVerifiedState,
  PaiSafeStatus,
  PaiSafeSurfaceResult,
  PaiSafeSurfaceState,
  ProcessorEventSnapshot
} from "./paiSafeSurfaceContracts";

function nowIso(): string {
  return new Date().toISOString();
}

function stableRef(value: string | undefined, fallback: string): string {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function statusFromFundTrackerState(
  processorEvent: ProcessorEventSnapshot,
  fundTrackerState: FundTrackerVerifiedState
): PaiSafeStatus {
  if (fundTrackerState.decisionKind === "ACTIVATED_TRANSACTION_STATE" && fundTrackerState.activatedTransactionStateRef) {
    return "activated";
  }

  if (fundTrackerState.decisionKind === "VERIFIED_COMMITMENT" && fundTrackerState.verifiedCommitment === true) {
    return "governed_safe";
  }

  if (fundTrackerState.decisionKind === "HELD_FOR_REVIEW") {
    return "held_for_review";
  }

  if (fundTrackerState.decisionKind === "REFUSED") {
    return "refused";
  }

  if (fundTrackerState.decisionKind === "VERIFICATION_PENDING") {
    return "verification_pending";
  }

  if (
    fundTrackerState.decisionKind === "PROCESSOR_EVENT_ONLY" ||
    processorEvent.processorStatus === "succeeded"
  ) {
    return "requires_attention";
  }

  return "not_started";
}

function consumerMessageForStatus(status: PaiSafeStatus, fundTrackerState: FundTrackerVerifiedState): string {
  if (status === "activated") {
    return "PAI-SAFE verified: this transaction has an Activated Transaction State and downstream eligibility may proceed.";
  }

  if (status === "governed_safe") {
    return "PAI-SAFE verified: FundTrackerAI checked the commitment before movement was allowed.";
  }

  if (status === "held_for_review") {
    return `PAI-SAFE hold: this transaction requires review before it can proceed.${fundTrackerState.reviewReason ? " Reason: " + fundTrackerState.reviewReason : ""}`;
  }

  if (status === "refused") {
    return `PAI-SAFE refused: this transaction did not pass FundTrackerAI verification.${fundTrackerState.refusalReason ? " Reason: " + fundTrackerState.refusalReason : ""}`;
  }

  if (status === "verification_pending") {
    return "PAI-SAFE pending: FundTrackerAI verification is still in progress.";
  }

  if (status === "requires_attention") {
    return "PAI-SAFE attention required: processor success alone is not verified commitment.";
  }

  return "PAI-SAFE not started: no governed payment verification has begun.";
}

function operatorActionForStatus(status: PaiSafeStatus): FinTechionOversightProjection["operatorActionSuggested"] {
  if (status === "held_for_review") return "review";
  if (status === "refused") return "respond";
  if (status === "requires_attention") return "monitor";
  return "none";
}

export function buildPaiSafeSurfaceState(
  processorEvent: ProcessorEventSnapshot,
  fundTrackerState: FundTrackerVerifiedState
): PaiSafeSurfaceResult {
  const status = statusFromFundTrackerState(processorEvent, fundTrackerState);
  const createdAt = nowIso();

  const fundTrackerDecisionRef = stableRef(
    fundTrackerState.fundTrackerDecisionRef,
    "NO_FUNDTRACKER_DECISION_REF"
  );

  const safeToProceed = status === "governed_safe" || status === "activated";
  const downstreamActivationEligible =
    status === "activated" &&
    typeof fundTrackerState.activatedTransactionStateRef === "string" &&
    fundTrackerState.activatedTransactionStateRef.length > 0;

  const paiSafeId = `pai_safe_${fundTrackerState.transactionRef}`;

  const surfaceState: PaiSafeSurfaceState = {
    paiSafeId,
    transactionRef: fundTrackerState.transactionRef,
    fundTrackerDecisionRef,
    ...(fundTrackerState.activatedTransactionStateRef
      ? { activatedTransactionStateRef: fundTrackerState.activatedTransactionStateRef }
      : {}),
    status,
    consumerMessage: consumerMessageForStatus(status, fundTrackerState),
    safeToProceed,
    downstreamActivationEligible,
    authority: "DISPLAY_ONLY",
    processorEventIsAuthority: false,
    fundTrackerIsTruthSource: true,
    paiSafeCreatesTransactionTruth: false,
    paiSafeCreatesCommitmentVerification: false,
    paiSafeCreatesEntitlement: false,
    paiSafeCreatesActivation: false,
    paiSafeOverridesFundTrackerAI: false,
    finTechionAICreatesTransactionTruth: false,
    finTechionAIOverridesFundTrackerAI: false,
    createdAt,
    boundary: {
      paiSafeIsBrandedSurfaceOnly: true,
      fundTrackerAIRemainsTransactionTruth: true,
      finTechionAIRemainsOperatorOversight: true,
      processorSuccessAloneCannotGovernSafe: true,
      activatedTransactionStateRequiredForDownstreamActivation: true,
      gtisIsInfrastructureDescriptorOnly: true
    }
  };

  const oversightProjection: FinTechionOversightProjection = {
    oversightId: `fintechionai_oversight_${fundTrackerState.transactionRef}`,
    transactionRef: fundTrackerState.transactionRef,
    paiSafeId,
    paiSafeStatus: status,
    fundTrackerDecisionRef,
    ...(fundTrackerState.activatedTransactionStateRef
      ? { activatedTransactionStateRef: fundTrackerState.activatedTransactionStateRef }
      : {}),
    oversightSummary:
      "FinTechionAI may monitor and interpret PAI-SAFE display state, but does not create or override transaction truth.",
    operatorActionSuggested: operatorActionForStatus(status),
    boundary: {
      oversightIsNotTransactionTruth: true,
      oversightDoesNotOverrideFundTrackerAI: true,
      oversightDoesNotCreateActivation: true,
      oversightDoesNotCreatePaymentAuthority: true
    }
  };

  return {
    surfaceState,
    oversightProjection
  };
}

