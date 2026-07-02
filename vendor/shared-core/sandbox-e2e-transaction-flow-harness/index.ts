import {
  adaptSandboxRailPayload,
  buildValidStripeSandboxPayload
} from "../sandbox-rail-adapter-harness";

import type {
  RawSandboxRailPayload,
  SandboxRailAdapterResult
} from "../sandbox-rail-adapter-harness";

import {
  evaluateSandboxTransactionAuthority
} from "../fundtrackerai-sandbox-transaction-authority";

import type {
  SandboxActivatedTransactionState,
  SandboxEvaluationResult
} from "../fundtrackerai-sandbox-transaction-authority";

import {
  adaptFundTrackerToPaiSafeSurface
} from "../pai-safe-surface-contract";

import type {
  PaiSafeSurfaceContractResult
} from "../pai-safe-surface-contract";

import {
  mapPaiSafeContractToConsumerDisplay
} from "../pai-safe-ui-state-mapping";

import type {
  PaiSafeUiMappingResult
} from "../pai-safe-ui-state-mapping";

export type SandboxE2EFlowStatus =
  | "SANDBOX_E2E_TRANSACTION_FLOW_READY"
  | "SANDBOX_E2E_TRANSACTION_FLOW_BLOCKED"
  | "SANDBOX_E2E_TRANSACTION_FLOW_REFUSED";

export type SandboxE2ERefusalCode =
  | "INTAKE_REFUSED"
  | "FUNDTRACKER_VERIFY_REFUSED"
  | "SANDBOX_ATS_REFUSED"
  | "PAI_SAFE_SURFACE_BLOCKED"
  | "PAI_SAFE_UI_MAPPING_BLOCKED"
  | "LIVE_CAPABILITY_LEAK_REFUSED";

export interface LiveRailAuthority {
  readonly __brand: "LIVE_RAIL_AUTHORITY";
  mayConnectLiveRails: true;
}

export interface LivePaymentProcessingAuthority {
  readonly __brand: "LIVE_PAYMENT_PROCESSING_AUTHORITY";
  mayProcessLivePayment: true;
}

export interface LiveTransactionTruthAuthority {
  readonly __brand: "LIVE_TRANSACTION_TRUTH_AUTHORITY";
  mayCreateLiveTruth: true;
}

export interface LiveActivatedTransactionStateAuthority {
  readonly __brand: "LIVE_ATS_AUTHORITY";
  mayCreateLiveATS: true;
}

export interface RuntimeActivationAuthority {
  readonly __brand: "RUNTIME_ACTIVATION_AUTHORITY";
  mayActivateRuntime: true;
}

export interface SandboxEndToEndTransactionFlowResult {
  readonly __brand: "SANDBOX_E2E_TRANSACTION_FLOW_RESULT";
  flowId: string;
  transactionRef: string;
  status: SandboxE2EFlowStatus;
  refusalCodes: SandboxE2ERefusalCode[];
  intake: SandboxRailAdapterResult;
  fundTrackerVerification?: SandboxEvaluationResult;
  sandboxAtsEmission?: SandboxEvaluationResult;
  sandboxAts?: SandboxActivatedTransactionState;
  paiSafeSurface?: PaiSafeSurfaceContractResult;
  paiSafeUi?: PaiSafeUiMappingResult;
  proofChain: {
    railPayloadRef?: string;
    sandboxProcessorEventRef?: string;
    verifiedOpportunityRef?: string;
    fundTrackerDecisionRef?: string;
    sandboxAtsRef?: string;
    paiSafeContractId?: string;
    paiSafeDisplayId?: string;
  };
  boundary: {
    sandboxOnly: true;
    e2eCreatesNoLiveRails: true;
    e2eCreatesNoLivePaymentProcessing: true;
    e2eCreatesNoLiveTransactionTruth: true;
    e2eCreatesNoLiveATS: true;
    e2eCreatesNoCustodyTransfer: true;
    e2eCreatesNoRuntimeActivation: true;
    fundTrackerAIIsOnlySandboxTruthAuthority: true;
    paiSafeIsDisplayOnly: true;
    uiIsDisplayOnly: true;
  };
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function hasLiveLeak(result: SandboxEndToEndTransactionFlowResult): boolean {
  return !(
    result.boundary.e2eCreatesNoLiveRails === true &&
    result.boundary.e2eCreatesNoLivePaymentProcessing === true &&
    result.boundary.e2eCreatesNoLiveTransactionTruth === true &&
    result.boundary.e2eCreatesNoLiveATS === true &&
    result.boundary.e2eCreatesNoCustodyTransfer === true &&
    result.boundary.e2eCreatesNoRuntimeActivation === true
  );
}

function baseBoundary(): SandboxEndToEndTransactionFlowResult["boundary"] {
  return {
    sandboxOnly: true,
    e2eCreatesNoLiveRails: true,
    e2eCreatesNoLivePaymentProcessing: true,
    e2eCreatesNoLiveTransactionTruth: true,
    e2eCreatesNoLiveATS: true,
    e2eCreatesNoCustodyTransfer: true,
    e2eCreatesNoRuntimeActivation: true,
    fundTrackerAIIsOnlySandboxTruthAuthority: true,
    paiSafeIsDisplayOnly: true,
    uiIsDisplayOnly: true
  };
}

export function runSandboxEndToEndTransactionFlow(
  payload: RawSandboxRailPayload
): SandboxEndToEndTransactionFlowResult {
  const transactionRef = payload.transactionRef ?? "sandbox_e2e_unknown_transaction";
  const refusalCodes: SandboxE2ERefusalCode[] = [];

  const intake = adaptSandboxRailPayload(payload);

  if (intake.status !== "SANDBOX_RAIL_ADAPTER_ACCEPTED" || !intake.acceptedEvent) {
    refusalCodes.push("INTAKE_REFUSED");

    return {
      __brand: "SANDBOX_E2E_TRANSACTION_FLOW_RESULT",
      flowId: `sandbox_e2e_${transactionRef}`,
      transactionRef,
      status: "SANDBOX_E2E_TRANSACTION_FLOW_REFUSED",
      refusalCodes: unique(refusalCodes),
      intake,
      proofChain: {
        railPayloadRef: payload.eventRef
      },
      boundary: baseBoundary()
    };
  }

  const accepted = intake.acceptedEvent;

  const fundTrackerVerification = evaluateSandboxTransactionAuthority({
    actor: "FundTrackerAI",
    now: payload.createdAt ?? new Date().toISOString(),
    verifiedOpportunity: accepted.verifiedOpportunity,
    processorEvent: accepted.normalizedEvent,
    requestedDecision: "VERIFY_SANDBOX_COMMITMENT"
  });

  if (fundTrackerVerification.status !== "SANDBOX_TRANSACTION_MUTATION_APPLIED") {
    refusalCodes.push("FUNDTRACKER_VERIFY_REFUSED");

    return {
      __brand: "SANDBOX_E2E_TRANSACTION_FLOW_RESULT",
      flowId: `sandbox_e2e_${transactionRef}`,
      transactionRef,
      status: "SANDBOX_E2E_TRANSACTION_FLOW_REFUSED",
      refusalCodes: unique(refusalCodes),
      intake,
      fundTrackerVerification,
      proofChain: {
        railPayloadRef: payload.eventRef,
        sandboxProcessorEventRef: accepted.normalizedEvent.eventRef,
        verifiedOpportunityRef: accepted.verifiedOpportunity.verifiedOpportunityRef,
        fundTrackerDecisionRef: fundTrackerVerification.record.fundTrackerDecisionRef
      },
      boundary: baseBoundary()
    };
  }

  const atsProcessorEvent = {
    ...accepted.normalizedEvent,
    replayNonce: `${accepted.normalizedEvent.replayNonce}_ats_emit`
  };

  const sandboxAtsEmission = evaluateSandboxTransactionAuthority({
    actor: "FundTrackerAI",
    now: payload.createdAt ?? new Date().toISOString(),
    existingRecord: fundTrackerVerification.record,
    verifiedOpportunity: accepted.verifiedOpportunity,
    processorEvent: atsProcessorEvent,
    requestedDecision: "EMIT_SANDBOX_ATS"
  });

  if (sandboxAtsEmission.status !== "SANDBOX_ATS_EMITTED" || !sandboxAtsEmission.emittedATS) {
    refusalCodes.push("SANDBOX_ATS_REFUSED");

    return {
      __brand: "SANDBOX_E2E_TRANSACTION_FLOW_RESULT",
      flowId: `sandbox_e2e_${transactionRef}`,
      transactionRef,
      status: "SANDBOX_E2E_TRANSACTION_FLOW_REFUSED",
      refusalCodes: unique(refusalCodes),
      intake,
      fundTrackerVerification,
      sandboxAtsEmission,
      proofChain: {
        railPayloadRef: payload.eventRef,
        sandboxProcessorEventRef: accepted.normalizedEvent.eventRef,
        verifiedOpportunityRef: accepted.verifiedOpportunity.verifiedOpportunityRef,
        fundTrackerDecisionRef: fundTrackerVerification.record.fundTrackerDecisionRef
      },
      boundary: baseBoundary()
    };
  }

  const sandboxAts = sandboxAtsEmission.emittedATS;

  const paiSafeSurface = adaptFundTrackerToPaiSafeSurface({
    __brand: "FUNDTRACKER_SURFACE_OUTPUT",
    transactionRef,
    processorEventRef: accepted.normalizedEvent.eventRef,
    fundTrackerDecisionRef: sandboxAts.fundTrackerDecisionRef,
    activatedTransactionStateRef: sandboxAts.atsRef,
    verifiedOpportunityRef: sandboxAts.verifiedOpportunityRef,
    processorEventKind: "success",
    fundTrackerDecisionKind: "verified",
    activatedTransactionStateKind: "present",
    emittedBy: "FundTrackerAI",
    createdAt: payload.createdAt ?? new Date().toISOString()
  });

  if (paiSafeSurface.status !== "PAI_SAFE_SURFACE_CONTRACT_READY") {
    refusalCodes.push("PAI_SAFE_SURFACE_BLOCKED");

    return {
      __brand: "SANDBOX_E2E_TRANSACTION_FLOW_RESULT",
      flowId: `sandbox_e2e_${transactionRef}`,
      transactionRef,
      status: "SANDBOX_E2E_TRANSACTION_FLOW_BLOCKED",
      refusalCodes: unique(refusalCodes),
      intake,
      fundTrackerVerification,
      sandboxAtsEmission,
      sandboxAts,
      paiSafeSurface,
      proofChain: {
        railPayloadRef: payload.eventRef,
        sandboxProcessorEventRef: accepted.normalizedEvent.eventRef,
        verifiedOpportunityRef: sandboxAts.verifiedOpportunityRef,
        fundTrackerDecisionRef: sandboxAts.fundTrackerDecisionRef,
        sandboxAtsRef: sandboxAts.atsRef,
        paiSafeContractId: paiSafeSurface.contractId
      },
      boundary: baseBoundary()
    };
  }

  const paiSafeUi = mapPaiSafeContractToConsumerDisplay(paiSafeSurface.surfaceState);

  if (paiSafeUi.status !== "PAI_SAFE_UI_STATE_MAPPING_READY") {
    refusalCodes.push("PAI_SAFE_UI_MAPPING_BLOCKED");
  }

  const result: SandboxEndToEndTransactionFlowResult = {
    __brand: "SANDBOX_E2E_TRANSACTION_FLOW_RESULT",
    flowId: `sandbox_e2e_${transactionRef}`,
    transactionRef,
    status:
      refusalCodes.length === 0
        ? "SANDBOX_E2E_TRANSACTION_FLOW_READY"
        : "SANDBOX_E2E_TRANSACTION_FLOW_BLOCKED",
    refusalCodes: unique(refusalCodes),
    intake,
    fundTrackerVerification,
    sandboxAtsEmission,
    sandboxAts,
    paiSafeSurface,
    paiSafeUi,
    proofChain: {
      railPayloadRef: payload.eventRef,
      sandboxProcessorEventRef: accepted.normalizedEvent.eventRef,
      verifiedOpportunityRef: sandboxAts.verifiedOpportunityRef,
      fundTrackerDecisionRef: sandboxAts.fundTrackerDecisionRef,
      sandboxAtsRef: sandboxAts.atsRef,
      paiSafeContractId: paiSafeSurface.contractId,
      paiSafeDisplayId: paiSafeUi.displayState.displayId
    },
    boundary: baseBoundary()
  };

  if (hasLiveLeak(result)) {
    return {
      ...result,
      status: "SANDBOX_E2E_TRANSACTION_FLOW_BLOCKED",
      refusalCodes: unique([...result.refusalCodes, "LIVE_CAPABILITY_LEAK_REFUSED"])
    };
  }

  return result;
}

export function buildValidSandboxE2EPayload(transactionRef: string): RawSandboxRailPayload {
  return buildValidStripeSandboxPayload(transactionRef);
}

export const SANDBOX_E2E_TRANSACTION_FLOW_HARNESS_DOCTRINE = {
  name: "Sandbox End-to-End Transaction Flow Harness",
  class: "SANDBOX_E2E_TRANSACTION_FLOW_LAYER",
  purpose:
    "Prove a full sandbox-only transaction path from rail intake through FundTrackerAI verification, sandbox ATS emission, PAI-SAFE surface projection, and PAI-SAFE UI display mapping without creating live rails, live payment processing, live truth, live ATS, custody transfer, or runtime activation.",
  boundary: {
    sandboxOnly: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noLiveTransactionTruthCreated: true,
    noLiveATSCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true,
    fundTrackerAIIsOnlySandboxTruthAuthority: true,
    paiSafeIsDisplayOnly: true,
    uiIsDisplayOnly: true
  }
} as const;
