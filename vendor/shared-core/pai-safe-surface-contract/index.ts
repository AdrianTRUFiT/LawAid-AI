import {
  buildPaiSafeSurfaceProjection
} from "../pai-safe-surface-failure-taxonomy";

import type {
  ActivatedTransactionArtifactState,
  FundTrackerVerificationState,
  PaiSafeSurfaceDisplayStatus,
  PaiSafeFailureClass,
  PaiSafeSurfaceProjection,
  ProcessorTransportState,
  TransactionTruthState
} from "../pai-safe-surface-failure-taxonomy";

export type FundTrackerDecisionKind =
  | "not_started"
  | "pending"
  | "verified"
  | "held_for_review"
  | "refused"
  | "duplicate_detected"
  | "partial_payment_detected"
  | "race_condition_hold"
  | "stale_event_refused";

export type ProcessorEventKind =
  | "none"
  | "pending"
  | "success"
  | "failed"
  | "duplicate"
  | "partial"
  | "race_detected"
  | "timeout"
  | "reversed";

export type ActivatedTransactionStateKind =
  | "absent"
  | "present"
  | "invalid"
  | "superseded"
  | "duplicate_refused";

export interface FundTrackerSurfaceOutput {
  readonly __brand: "FUNDTRACKER_SURFACE_OUTPUT";
  transactionRef: string;
  processorEventRef?: string;
  fundTrackerDecisionRef?: string;
  activatedTransactionStateRef?: string;
  processorEventKind: ProcessorEventKind;
  fundTrackerDecisionKind: FundTrackerDecisionKind;
  activatedTransactionStateKind: ActivatedTransactionStateKind;
  emittedBy: "FundTrackerAI";
  verifiedOpportunityRef?: string;
  createdAt: string;
}

export interface PaiSafeSurfaceContractState {
  readonly __brand: "PAI_SAFE_SURFACE_CONTRACT_STATE";
  paiSafeContractId: string;
  transactionRef: string;
  status: PaiSafeSurfaceDisplayStatus;
  failureClass: PaiSafeFailureClass;
  consumerMessage: string;
  safeToDisplay: boolean;
  safeToProceed: boolean;
  downstreamActivationEligible: boolean;
  sourceRefs: {
    processorEventRef?: string;
    fundTrackerDecisionRef?: string;
    activatedTransactionStateRef?: string;
    verifiedOpportunityRef?: string;
  };
  visualDistinctions: {
    processorTransportVisible: boolean;
    fundTrackerVerificationVisible: boolean;
    activatedTransactionStateVisible: boolean;
    processorSuccessIsAuthority: false;
    fundTrackerIsTruthSource: true;
    displayIsAuthority: false;
  };
  readOnlyContract: {
    paiSafeHasWritePath: false;
    paiSafeMakesDecisions: false;
    paiSafeMutatesState: false;
    paiSafeProcessesPayment: false;
    paiSafeCreatesATS: false;
    paiSafeOverridesFundTrackerAI: false;
    paiSafeCreatesWalletBehavior: false;
    paiSafeCreatesAuthority: false;
  };
  boundary: {
    surfaceContractIsAdapterOnly: true;
    fundTrackerAIRemainsTruthSource: true;
    activatedTransactionStateRemainsActivationUnlock: true;
    processorSuccessIsNotAuthority: true;
    displayIsNotAuthority: true;
    noPaymentAuthorityCreated: true;
    noTransactionTruthCreated: true;
    noCustodyTransferCreated: true;
    noRuntimeActivationCreated: true;
  };
}

export interface PaiSafeSurfaceContractResult {
  contractId: string;
  status: "PAI_SAFE_SURFACE_CONTRACT_READY" | "PAI_SAFE_SURFACE_CONTRACT_BLOCKED";
  surfaceState: PaiSafeSurfaceContractState;
  sourceProjection: PaiSafeSurfaceProjection;
  refusalReasons: string[];
  boundary: {
    contractCreatesNoPaymentAuthority: true;
    contractCreatesNoTransactionTruth: true;
    contractCreatesNoCustodyTransfer: true;
    contractCreatesNoRuntimeActivation: true;
    contractIsReadOnlyProjection: true;
  };
}

export interface PaymentAuthorityState {
  readonly __brand: "PAYMENT_AUTHORITY_STATE";
  authorityId: string;
  canProcessPayment: true;
}

function processorToTransportState(kind: ProcessorEventKind): ProcessorTransportState {
  if (kind === "none") return "processor_not_started";
  if (kind === "pending") return "processor_pending";
  if (kind === "success") return "processor_success";
  if (kind === "failed") return "processor_failed";
  if (kind === "duplicate") return "processor_duplicate";
  if (kind === "partial") return "processor_partial";
  if (kind === "race_detected") return "processor_race_detected";
  if (kind === "timeout") return "processor_timeout";
  return "processor_reversed";
}

function decisionToVerificationState(kind: FundTrackerDecisionKind): FundTrackerVerificationState {
  if (kind === "not_started") return "fundtracker_not_started";
  if (kind === "pending") return "fundtracker_pending";
  if (kind === "verified") return "fundtracker_verified";
  if (kind === "held_for_review") return "fundtracker_held_for_review";
  if (kind === "refused") return "fundtracker_refused";
  if (kind === "duplicate_detected") return "fundtracker_duplicate_detected";
  if (kind === "partial_payment_detected") return "fundtracker_partial_payment_detected";
  if (kind === "race_condition_hold") return "fundtracker_race_condition_hold";
  return "fundtracker_stale_event_refused";
}

function atsToArtifactState(kind: ActivatedTransactionStateKind): ActivatedTransactionArtifactState {
  if (kind === "absent") return "ats_absent";
  if (kind === "present") return "ats_present";
  if (kind === "invalid") return "ats_invalid";
  if (kind === "superseded") return "ats_superseded";
  return "ats_duplicate_refused";
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function adaptFundTrackerToPaiSafeSurface(
  output: FundTrackerSurfaceOutput
): PaiSafeSurfaceContractResult {
  const refusalReasons: string[] = [];

  if (output.emittedBy !== "FundTrackerAI") {
    refusalReasons.push("SOURCE_MUST_BE_FUNDTRACKERAI");
  }

  if (output.fundTrackerDecisionKind !== "not_started" && !hasText(output.fundTrackerDecisionRef)) {
    refusalReasons.push("FUNDTRACKER_DECISION_REF_REQUIRED");
  }

  if (output.activatedTransactionStateKind === "present" && !hasText(output.activatedTransactionStateRef)) {
    refusalReasons.push("ATS_REF_REQUIRED_WHEN_PRESENT");
  }

  const sourceProjection = buildPaiSafeSurfaceProjection({
    transactionRef: output.transactionRef,
    ...(output.processorEventRef ? { processorEventRef: output.processorEventRef } : {}),
    ...(output.fundTrackerDecisionRef ? { fundTrackerDecisionRef: output.fundTrackerDecisionRef } : {}),
    ...(output.activatedTransactionStateRef ? { activatedTransactionStateRef: output.activatedTransactionStateRef } : {}),
    processorTransportState: processorToTransportState(output.processorEventKind),
    fundTrackerVerificationState: decisionToVerificationState(output.fundTrackerDecisionKind),
    activatedTransactionArtifactState: atsToArtifactState(output.activatedTransactionStateKind)
  });

  if (refusalReasons.length > 0) {
    sourceProjection.safeToProceed = false;
    sourceProjection.downstreamActivationEligible = false;
  }

  const surfaceState: PaiSafeSurfaceContractState = {
    __brand: "PAI_SAFE_SURFACE_CONTRACT_STATE",
    paiSafeContractId: `pai_safe_contract_${output.transactionRef}`,
    transactionRef: output.transactionRef,
    status: sourceProjection.status,
    failureClass: sourceProjection.failureClass,
    consumerMessage:
      refusalReasons.length > 0
        ? "PAI-SAFE cannot display governed confidence until FundTrackerAI source references are complete."
        : sourceProjection.consumerMessage,
    safeToDisplay: true,
    safeToProceed: refusalReasons.length === 0 && sourceProjection.safeToProceed,
    downstreamActivationEligible: refusalReasons.length === 0 && sourceProjection.downstreamActivationEligible,
    sourceRefs: {
      ...(output.processorEventRef ? { processorEventRef: output.processorEventRef } : {}),
      ...(output.fundTrackerDecisionRef ? { fundTrackerDecisionRef: output.fundTrackerDecisionRef } : {}),
      ...(output.activatedTransactionStateRef ? { activatedTransactionStateRef: output.activatedTransactionStateRef } : {}),
      ...(output.verifiedOpportunityRef ? { verifiedOpportunityRef: output.verifiedOpportunityRef } : {})
    },
    visualDistinctions: {
      processorTransportVisible: sourceProjection.visualDistinctions.processorTransportVisible,
      fundTrackerVerificationVisible: sourceProjection.visualDistinctions.fundTrackerVerificationVisible,
      activatedTransactionStateVisible: sourceProjection.visualDistinctions.activatedTransactionStateVisible,
      processorSuccessIsAuthority: false,
      fundTrackerIsTruthSource: true,
      displayIsAuthority: false
    },
    readOnlyContract: {
      paiSafeHasWritePath: false,
      paiSafeMakesDecisions: false,
      paiSafeMutatesState: false,
      paiSafeProcessesPayment: false,
      paiSafeCreatesATS: false,
      paiSafeOverridesFundTrackerAI: false,
      paiSafeCreatesWalletBehavior: false,
      paiSafeCreatesAuthority: false
    },
    boundary: {
      surfaceContractIsAdapterOnly: true,
      fundTrackerAIRemainsTruthSource: true,
      activatedTransactionStateRemainsActivationUnlock: true,
      processorSuccessIsNotAuthority: true,
      displayIsNotAuthority: true,
      noPaymentAuthorityCreated: true,
      noTransactionTruthCreated: true,
      noCustodyTransferCreated: true,
      noRuntimeActivationCreated: true
    }
  };

  return {
    contractId: surfaceState.paiSafeContractId,
    status:
      refusalReasons.length === 0
        ? "PAI_SAFE_SURFACE_CONTRACT_READY"
        : "PAI_SAFE_SURFACE_CONTRACT_BLOCKED",
    surfaceState,
    sourceProjection,
    refusalReasons: unique(refusalReasons),
    boundary: {
      contractCreatesNoPaymentAuthority: true,
      contractCreatesNoTransactionTruth: true,
      contractCreatesNoCustodyTransfer: true,
      contractCreatesNoRuntimeActivation: true,
      contractIsReadOnlyProjection: true
    }
  };
}

export function buildSampleFundTrackerOutputs(): FundTrackerSurfaceOutput[] {
  return [
    {
      __brand: "FUNDTRACKER_SURFACE_OUTPUT",
      transactionRef: "surface_processor_only",
      processorEventRef: "processor_evt_surface_001",
      processorEventKind: "success",
      fundTrackerDecisionKind: "not_started",
      activatedTransactionStateKind: "absent",
      emittedBy: "FundTrackerAI",
      createdAt: "2026-04-28T00:00:00.000Z"
    },
    {
      __brand: "FUNDTRACKER_SURFACE_OUTPUT",
      transactionRef: "surface_verified_no_ats",
      processorEventRef: "processor_evt_surface_002",
      fundTrackerDecisionRef: "ft_decision_surface_002",
      verifiedOpportunityRef: "verified_opp_surface_002",
      processorEventKind: "success",
      fundTrackerDecisionKind: "verified",
      activatedTransactionStateKind: "absent",
      emittedBy: "FundTrackerAI",
      createdAt: "2026-04-28T00:00:01.000Z"
    },
    {
      __brand: "FUNDTRACKER_SURFACE_OUTPUT",
      transactionRef: "surface_activated",
      processorEventRef: "processor_evt_surface_003",
      fundTrackerDecisionRef: "ft_decision_surface_003",
      activatedTransactionStateRef: "ats_surface_003",
      verifiedOpportunityRef: "verified_opp_surface_003",
      processorEventKind: "success",
      fundTrackerDecisionKind: "verified",
      activatedTransactionStateKind: "present",
      emittedBy: "FundTrackerAI",
      createdAt: "2026-04-28T00:00:02.000Z"
    },
    {
      __brand: "FUNDTRACKER_SURFACE_OUTPUT",
      transactionRef: "surface_duplicate",
      processorEventRef: "processor_evt_surface_dup",
      fundTrackerDecisionRef: "ft_decision_surface_dup",
      processorEventKind: "duplicate",
      fundTrackerDecisionKind: "duplicate_detected",
      activatedTransactionStateKind: "duplicate_refused",
      emittedBy: "FundTrackerAI",
      createdAt: "2026-04-28T00:00:03.000Z"
    },
    {
      __brand: "FUNDTRACKER_SURFACE_OUTPUT",
      transactionRef: "surface_partial",
      processorEventRef: "processor_evt_surface_partial",
      fundTrackerDecisionRef: "ft_decision_surface_partial",
      processorEventKind: "partial",
      fundTrackerDecisionKind: "partial_payment_detected",
      activatedTransactionStateKind: "absent",
      emittedBy: "FundTrackerAI",
      createdAt: "2026-04-28T00:00:04.000Z"
    },
    {
      __brand: "FUNDTRACKER_SURFACE_OUTPUT",
      transactionRef: "surface_race",
      processorEventRef: "processor_evt_surface_race",
      fundTrackerDecisionRef: "ft_decision_surface_race",
      processorEventKind: "race_detected",
      fundTrackerDecisionKind: "race_condition_hold",
      activatedTransactionStateKind: "absent",
      emittedBy: "FundTrackerAI",
      createdAt: "2026-04-28T00:00:05.000Z"
    },
    {
      __brand: "FUNDTRACKER_SURFACE_OUTPUT",
      transactionRef: "surface_refused",
      processorEventRef: "processor_evt_surface_refused",
      fundTrackerDecisionRef: "ft_decision_surface_refused",
      processorEventKind: "success",
      fundTrackerDecisionKind: "refused",
      activatedTransactionStateKind: "absent",
      emittedBy: "FundTrackerAI",
      createdAt: "2026-04-28T00:00:06.000Z"
    }
  ];
}

export const PAI_SAFE_SURFACE_CONTRACT_DOCTRINE = {
  name: "FundTrackerAI ? PAI-SAFE Surface Contract",
  class: "READ_ONLY_CONSUMER_SAFE_SURFACE_ADAPTER",
  purpose:
    "Map FundTrackerAI outputs into consumer-safe PAI-SAFE surface states while preserving artifact references and preventing display authority.",
  boundary: {
    pureAdapterOnly: true,
    noPaymentProcessing: true,
    noVerificationLogic: true,
    noTransactionMutation: true,
    noFallbackRouting: true,
    noWalletBehavior: true,
    noAuthorityClaims: true,
    fundTrackerAIRemainsTruthSource: true
  }
} as const;

export type _PaiSafeSurfaceContractCannotBeTruth = TransactionTruthState;
