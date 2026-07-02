export type PaiSafeStatus =
  | "not_started"
  | "verification_pending"
  | "governed_safe"
  | "held_for_review"
  | "refused"
  | "activated"
  | "requires_attention";

export type FundTrackerDecisionKind =
  | "NO_DECISION"
  | "PROCESSOR_EVENT_ONLY"
  | "VERIFICATION_PENDING"
  | "VERIFIED_COMMITMENT"
  | "HELD_FOR_REVIEW"
  | "REFUSED"
  | "ACTIVATED_TRANSACTION_STATE";

export type PaiSafeSurfaceAuthority =
  | "DISPLAY_ONLY";

export interface ProcessorEventSnapshot {
  processorEventRef?: string;
  processorStatus:
    | "none"
    | "pending"
    | "succeeded"
    | "failed";
  processorEventIsAuthority: false;
}

export interface FundTrackerVerifiedState {
  transactionRef: string;
  fundTrackerDecisionRef?: string;
  decisionKind: FundTrackerDecisionKind;
  verifiedCommitment: boolean;
  activatedTransactionStateRef?: string;
  refusalReason?: string;
  reviewReason?: string;
  createdAt: string;
  boundary: {
    fundTrackerIsTruthSource: true;
    processorEventIsAuthority: false;
    paymentMovementIsVerifiedCommitment: false;
    checkoutSuccessIsActivationAuthority: false;
  };
}

export interface PaiSafeSurfaceState {
  paiSafeId: string;
  transactionRef: string;
  fundTrackerDecisionRef: string;
  activatedTransactionStateRef?: string;
  status: PaiSafeStatus;
  consumerMessage: string;
  safeToProceed: boolean;
  downstreamActivationEligible: boolean;
  authority: PaiSafeSurfaceAuthority;
  processorEventIsAuthority: false;
  fundTrackerIsTruthSource: true;
  paiSafeCreatesTransactionTruth: false;
  paiSafeCreatesCommitmentVerification: false;
  paiSafeCreatesEntitlement: false;
  paiSafeCreatesActivation: false;
  paiSafeOverridesFundTrackerAI: false;
  finTechionAICreatesTransactionTruth: false;
  finTechionAIOverridesFundTrackerAI: false;
  createdAt: string;
  boundary: {
    paiSafeIsBrandedSurfaceOnly: true;
    fundTrackerAIRemainsTransactionTruth: true;
    finTechionAIRemainsOperatorOversight: true;
    processorSuccessAloneCannotGovernSafe: true;
    activatedTransactionStateRequiredForDownstreamActivation: true;
    gtisIsInfrastructureDescriptorOnly: true;
  };
}

export interface FinTechionOversightProjection {
  oversightId: string;
  transactionRef: string;
  paiSafeId: string;
  paiSafeStatus: PaiSafeStatus;
  fundTrackerDecisionRef: string;
  activatedTransactionStateRef?: string;
  oversightSummary: string;
  operatorActionSuggested:
    | "none"
    | "monitor"
    | "review"
    | "respond";
  boundary: {
    oversightIsNotTransactionTruth: true;
    oversightDoesNotOverrideFundTrackerAI: true;
    oversightDoesNotCreateActivation: true;
    oversightDoesNotCreatePaymentAuthority: true;
  };
}

export interface PaiSafeSurfaceResult {
  surfaceState: PaiSafeSurfaceState;
  oversightProjection: FinTechionOversightProjection;
}

