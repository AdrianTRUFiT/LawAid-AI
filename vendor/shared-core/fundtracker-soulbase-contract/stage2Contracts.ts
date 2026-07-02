import type {
  CustodyAuthorization,
  CustodyClass,
  RedactionLevel,
  RetentionRule
} from "../memory-boundary";

export type Stage2ContractStatus =
  | "FUNDTRACKER_SOULBASE_PROJECTION_READY"
  | "FUNDTRACKER_SOULBASE_PROJECTION_BLOCKED";

export type ActivatedTransactionStateStatus =
  | "ACTIVATED"
  | "HELD"
  | "REFUSED"
  | "PENDING"
  | "UNKNOWN";

export type EntitlementState =
  | "ENTITLED"
  | "NOT_ENTITLED"
  | "PENDING_REVIEW"
  | "REVOKED";

export type ProjectionDecision =
  | "EMIT_MEMORY_PROJECTION"
  | "REQUIRE_SOULVAULT_CUSTODY"
  | "REFUSE_PROJECTION";

export type ProjectionSourceAuthority =
  | "FundTrackerAI";

export interface ActivatedTransactionStateLite {
  activatedTransactionStateId: string;
  status: ActivatedTransactionStateStatus;
  sourceAuthority: ProjectionSourceAuthority;
  transactionProofRef: string;
  verifiedCommitment: boolean;
  entitlementState: EntitlementState;
  amountMinor: number;
  currency: string;
  merchantContinuityRef: string;
  createdAt: string;
}

export interface FinancialMemoryProjectionRequest {
  requestId: string;
  stage2ExplicitlyAuthorized: boolean;
  activatedTransactionState: ActivatedTransactionStateLite;
  custodyClass?: CustodyClass;
  redactionLevel?: RedactionLevel;
  retentionRule?: RetentionRule;
  authorization: CustodyAuthorization;
  ledgerSafeSummary?: string;
  continuityPattern?: string;
  userContainerScope?: string;
  downstreamConsumerId?: string;
  containsRawProcessorObject: boolean;
  containsRawBankStatement: boolean;
  containsFullAccountNumber: boolean;
  containsUnredactedPaymentMethod: boolean;
  containsPrivateSourceDocument: boolean;
  containsLegalEvidenceFile: boolean;
  containsUnrestrictedFinancialHistory: boolean;
  processorEventTreatedAsTruth: boolean;
}

export interface FundTrackerAIToSoulBaseMemoryProjection {
  artifactType: "FundTrackerAIToSoulBaseMemoryProjection";
  projectionId: string;
  sourceAuthority: "FundTrackerAI";
  destination: "SoulBaseAI";
  activatedTransactionStateId: string;
  transactionProofRef: string;
  entitlementState: EntitlementState;
  ledgerSafeSummary: string;
  continuityPattern: string;
  merchantContinuityRef: string;
  custodyClass: CustodyClass;
  redactionLevel: RedactionLevel;
  retentionRule: RetentionRule;
  userContainerScope: string;
  downstreamConsumerId: string;
  createdAt: string;
  boundary: {
    projectionIsNotTransactionTruth: true;
    projectionIsNotPaymentAuthority: true;
    projectionIsNotEntitlementAuthority: true;
    projectionIsNotCustodyTransfer: true;
    projectionDoesNotContainRawProcessorObject: true;
    projectionDoesNotContainRawBankStatement: true;
    projectionDoesNotContainFullAccountNumber: true;
    projectionDoesNotContainUnredactedPaymentMethod: true;
    fundTrackerAIRemainsFinancialTruth: true;
    soulBaseAIRemainsMemorySubstrate: true;
    soulVaultRemainsCustodyPlane: true;
    soulMemoryGovernsPersistence: true;
    defaultPostureIsDeny: true;
  };
}

export interface Stage2ProjectionGateDecision {
  requestId: string;
  status: Stage2ContractStatus;
  decision: ProjectionDecision;
  canEmitProjection: boolean;
  projection?: FundTrackerAIToSoulBaseMemoryProjection;
  refusalReasons: string[];
  requiredCorrections: string[];
  authorityTrace: {
    stage2ExplicitlyAuthorized: boolean;
    fundTrackerAIProvidedActivatedTransactionState: boolean;
    activatedTransactionStateVerified: boolean;
    custodyBoundaryPassed: boolean;
    soulMemoryGovernancePassed: boolean;
    processorEventRejectedAsTruth: boolean;
  };
  boundary: {
    paymentEventIsNotCommitmentTruth: true;
    commitmentTruthRequiresFundTrackerAI: true;
    rawProcessorObjectCannotCross: true;
    rawBankDataCannotCross: true;
    privateSourceDataRemainsCustody: true;
    soulBaseAIIsNotFinancialTruth: true;
    soulBaseAIIsNotPaymentAuthority: true;
    soulVaultRemainsCustodyPlane: true;
    fundTrackerAIRemainsTransactionTruth: true;
    stage2ContractIsProjectionOnly: true;
  };
}




