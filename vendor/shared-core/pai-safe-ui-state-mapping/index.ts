import type {
  PaiSafeSurfaceContractState
} from "../pai-safe-surface-contract";

export type PaiSafeUiTone =
  | "neutral"
  | "pending"
  | "safe"
  | "hold"
  | "warning"
  | "refused"
  | "activated"
  | "attention";

export type PaiSafeUiSeverity =
  | "INFO"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "BLOCKING";

export type PaiSafeUiPrimaryAction =
  | "none"
  | "wait"
  | "review_status"
  | "contact_support"
  | "continue"
  | "view_details";

export interface PaiSafeUiAuthorityState {
  readonly __brand: "PAI_SAFE_UI_AUTHORITY_STATE";
  mayAuthorizeTransaction: true;
}

export interface PaiSafeUiWalletBehavior {
  readonly __brand: "PAI_SAFE_UI_WALLET_BEHAVIOR";
  mayMoveFunds: true;
}

export interface PaiSafeConsumerDisplayState {
  readonly __brand: "PAI_SAFE_CONSUMER_DISPLAY_STATE";
  displayId: string;
  transactionRef: string;
  headline: string;
  subheadline: string;
  consumerExplanation: string;
  tone: PaiSafeUiTone;
  severity: PaiSafeUiSeverity;
  primaryAction: PaiSafeUiPrimaryAction;
  safeToShowConsumer: boolean;
  showProceedAffordance: boolean;
  showDownstreamUnlock: boolean;
  lanes: {
    processor: {
      visible: boolean;
      label: string;
      authority: false;
    };
    fundTracker: {
      visible: boolean;
      label: string;
      authority: true;
    };
    activatedTransactionState: {
      visible: boolean;
      label: string;
      authority: false;
      unlockArtifact: boolean;
    };
  };
  sourceRefs: {
    processorEventRef?: string;
    fundTrackerDecisionRef?: string;
    activatedTransactionStateRef?: string;
    verifiedOpportunityRef?: string;
  };
  boundary: {
    uiIsDisplayOnly: true;
    uiDoesNotCreatePaymentAuthority: true;
    uiDoesNotCreateTransactionTruth: true;
    uiDoesNotMutateTransactionState: true;
    uiDoesNotCreateATS: true;
    uiDoesNotCreateWalletBehavior: true;
    uiDoesNotOverrideFundTrackerAI: true;
    displayIsNotAuthority: true;
  };
}

export interface PaiSafeUiMappingResult {
  status: "PAI_SAFE_UI_STATE_MAPPING_READY" | "PAI_SAFE_UI_STATE_MAPPING_BLOCKED";
  displayState: PaiSafeConsumerDisplayState;
  blockedReasons: string[];
  boundary: {
    mappingCreatesNoPaymentAuthority: true;
    mappingCreatesNoTransactionTruth: true;
    mappingCreatesNoCustodyTransfer: true;
    mappingCreatesNoRuntimeActivation: true;
    mappingIsConsumerDisplayOnly: true;
  };
}

function createBaseLanes(contract: PaiSafeSurfaceContractState): PaiSafeConsumerDisplayState["lanes"] {
  return {
    processor: {
      visible: contract.visualDistinctions.processorTransportVisible,
      label: contract.visualDistinctions.processorTransportVisible
        ? "Processor event received"
        : "Processor event not shown",
      authority: false
    },
    fundTracker: {
      visible: contract.visualDistinctions.fundTrackerVerificationVisible,
      label: contract.visualDistinctions.fundTrackerVerificationVisible
        ? "FundTrackerAI verification state"
        : "FundTrackerAI verification pending",
      authority: true
    },
    activatedTransactionState: {
      visible: contract.visualDistinctions.activatedTransactionStateVisible,
      label: contract.visualDistinctions.activatedTransactionStateVisible
        ? "Activated Transaction State artifact present"
        : "Activated Transaction State not present",
      authority: false,
      unlockArtifact: contract.visualDistinctions.activatedTransactionStateVisible
    }
  };
}

export function mapPaiSafeContractToConsumerDisplay(
  contract: PaiSafeSurfaceContractState
): PaiSafeUiMappingResult {
  const blockedReasons: string[] = [];

  if (contract.visualDistinctions.processorSuccessIsAuthority !== false) {
    blockedReasons.push("PROCESSOR_SUCCESS_AUTHORITY_DISPLAY_REFUSED");
  }

  if (contract.visualDistinctions.displayIsAuthority !== false) {
    blockedReasons.push("DISPLAY_AUTHORITY_REFUSED");
  }

  if (contract.readOnlyContract.paiSafeHasWritePath !== false) {
    blockedReasons.push("UI_WRITE_PATH_REFUSED");
  }

  if (contract.readOnlyContract.paiSafeProcessesPayment !== false) {
    blockedReasons.push("PAYMENT_PROCESSING_REFUSED");
  }

  if (contract.readOnlyContract.paiSafeCreatesATS !== false) {
    blockedReasons.push("ATS_CREATION_REFUSED");
  }

  let headline = "PAI-SAFE status needs review";
  let subheadline = "This transaction requires attention before it can be shown as governed.";
  let consumerExplanation = contract.consumerMessage;
  let tone: PaiSafeUiTone = "attention";
  let severity: PaiSafeUiSeverity = "MEDIUM";
  let primaryAction: PaiSafeUiPrimaryAction = "review_status";
  let showProceedAffordance = false;
  let showDownstreamUnlock = false;

  if (contract.status === "processor_success_not_authority") {
    headline = "Payment event received";
    subheadline = "Processor success is visible, but it is not final transaction truth.";
    consumerExplanation = "The processor event was received. FundTrackerAI still needs to verify the commitment before this can proceed.";
    tone = "warning";
    severity = "MEDIUM";
    primaryAction = "wait";
  }

  if (contract.status === "verification_pending") {
    headline = "Verification pending";
    subheadline = "The transaction is still being checked.";
    consumerExplanation = "PAI-SAFE is waiting for FundTrackerAI verification before showing this as governed.";
    tone = "pending";
    severity = "INFO";
    primaryAction = "wait";
  }

  if (contract.status === "governed_safe") {
    headline = "Governed safe";
    subheadline = "FundTrackerAI has verified the commitment.";
    consumerExplanation = "The transaction is verified at the commitment layer. Downstream activation still requires the Activated Transaction State artifact.";
    tone = "safe";
    severity = "LOW";
    primaryAction = "continue";
    showProceedAffordance = contract.safeToProceed;
  }

  if (contract.status === "held_for_review") {
    headline = "Held for review";
    subheadline = "The transaction needs additional governed review.";
    consumerExplanation = "PAI-SAFE is showing a hold state because FundTrackerAI has not cleared this transaction for progression.";
    tone = "hold";
    severity = "HIGH";
    primaryAction = "review_status";
  }

  if (contract.status === "duplicate_detected") {
    headline = "Duplicate detected";
    subheadline = "Possible duplicate transaction activity was found.";
    consumerExplanation = "This transaction is not safe to treat as complete until the duplicate condition is resolved.";
    tone = "warning";
    severity = "HIGH";
    primaryAction = "review_status";
  }

  if (contract.status === "partial_payment") {
    headline = "Partial payment detected";
    subheadline = "The full governed commitment has not been verified.";
    consumerExplanation = "PAI-SAFE cannot show this as complete because only a partial payment condition is visible.";
    tone = "warning";
    severity = "HIGH";
    primaryAction = "review_status";
  }

  if (contract.status === "race_condition_hold") {
    headline = "Timing conflict detected";
    subheadline = "The transaction is held because competing timing signals were detected.";
    consumerExplanation = "PAI-SAFE is preventing premature confidence while the transaction state is reconciled.";
    tone = "hold";
    severity = "HIGH";
    primaryAction = "review_status";
  }

  if (contract.status === "refused") {
    headline = "Transaction refused";
    subheadline = "FundTrackerAI did not verify this commitment.";
    consumerExplanation = "This transaction cannot proceed because the verified commitment requirement was not met.";
    tone = "refused";
    severity = "BLOCKING";
    primaryAction = "contact_support";
  }

  if (contract.status === "activated") {
    headline = "Activated";
    subheadline = "FundTrackerAI verification and Activated Transaction State are present.";
    consumerExplanation = "This transaction has the required verified commitment and activation artifact for downstream eligibility.";
    tone = "activated";
    severity = "LOW";
    primaryAction = "continue";
    showProceedAffordance = contract.safeToProceed;
    showDownstreamUnlock = contract.downstreamActivationEligible;
  }

  if (contract.status === "requires_attention") {
    headline = "Attention required";
    subheadline = "This transaction cannot be shown as governed yet.";
    tone = "attention";
    severity = "HIGH";
    primaryAction = "review_status";
  }

  const displayState: PaiSafeConsumerDisplayState = {
    __brand: "PAI_SAFE_CONSUMER_DISPLAY_STATE",
    displayId: `pai_safe_ui_${contract.transactionRef}`,
    transactionRef: contract.transactionRef,
    headline,
    subheadline,
    consumerExplanation,
    tone,
    severity,
    primaryAction,
    safeToShowConsumer: blockedReasons.length === 0,
    showProceedAffordance: blockedReasons.length === 0 && showProceedAffordance,
    showDownstreamUnlock: blockedReasons.length === 0 && showDownstreamUnlock,
    lanes: createBaseLanes(contract),
    sourceRefs: contract.sourceRefs,
    boundary: {
      uiIsDisplayOnly: true,
      uiDoesNotCreatePaymentAuthority: true,
      uiDoesNotCreateTransactionTruth: true,
      uiDoesNotMutateTransactionState: true,
      uiDoesNotCreateATS: true,
      uiDoesNotCreateWalletBehavior: true,
      uiDoesNotOverrideFundTrackerAI: true,
      displayIsNotAuthority: true
    }
  };

  return {
    status: blockedReasons.length === 0
      ? "PAI_SAFE_UI_STATE_MAPPING_READY"
      : "PAI_SAFE_UI_STATE_MAPPING_BLOCKED",
    displayState,
    blockedReasons,
    boundary: {
      mappingCreatesNoPaymentAuthority: true,
      mappingCreatesNoTransactionTruth: true,
      mappingCreatesNoCustodyTransfer: true,
      mappingCreatesNoRuntimeActivation: true,
      mappingIsConsumerDisplayOnly: true
    }
  };
}

export const PAI_SAFE_UI_STATE_MAPPING_DOCTRINE = {
  name: "PAI-SAFE UI State Logic / Consumer Display Mapping",
  class: "CONSUMER_DISPLAY_MAPPING_LAYER",
  purpose:
    "Convert verified PAI-SAFE read-only surface contract states into consumer-safe UI language without creating authority or product behavior.",
  boundary: {
    uiIsDisplayOnly: true,
    displayIsNotAuthority: true,
    noPaymentProcessing: true,
    noTransactionMutation: true,
    noATSGeneration: true,
    noWalletBehavior: true,
    fundTrackerAIRemainsTruthSource: true
  }
} as const;
