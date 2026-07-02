export type SandboxTransactionStatus =
  | "SANDBOX_TRANSACTION_NOT_STARTED"
  | "SANDBOX_TRANSACTION_PENDING"
  | "SANDBOX_TRANSACTION_VERIFIED"
  | "SANDBOX_TRANSACTION_HELD"
  | "SANDBOX_TRANSACTION_REFUSED"
  | "SANDBOX_TRANSACTION_ACTIVATED";

export type SandboxProcessorEventKind =
  | "SANDBOX_PROCESSOR_EVENT_PENDING"
  | "SANDBOX_PROCESSOR_EVENT_SUCCESS"
  | "SANDBOX_PROCESSOR_EVENT_FAILED"
  | "SANDBOX_PROCESSOR_EVENT_DUPLICATE"
  | "SANDBOX_PROCESSOR_EVENT_PARTIAL"
  | "SANDBOX_PROCESSOR_EVENT_REPLAY"
  | "SANDBOX_PROCESSOR_EVENT_STALE";

export type SandboxFundTrackerDecision =
  | "VERIFY_SANDBOX_COMMITMENT"
  | "HOLD_SANDBOX_COMMITMENT"
  | "REFUSE_SANDBOX_COMMITMENT"
  | "EMIT_SANDBOX_ATS";

export type SandboxRefusalCode =
  | "LIVE_RAIL_EVENT_REFUSED"
  | "LIVE_PAYMENT_REFUSED"
  | "NON_SANDBOX_EVENT_REFUSED"
  | "PROCESSOR_EVENT_NOT_AUTHORITY"
  | "DUPLICATE_EVENT_REFUSED"
  | "REPLAY_EVENT_REFUSED"
  | "STALE_EVENT_REFUSED"
  | "PARTIAL_PAYMENT_REFUSED"
  | "FAILED_PROCESSOR_EVENT_REFUSED"
  | "MISSING_VERIFIED_OPPORTUNITY_REF"
  | "MISSING_SANDBOX_PROCESSOR_EVENT_REF"
  | "MISSING_FUNDTRACKER_DECISION_REF"
  | "ATS_REQUIRES_VERIFIED_SANDBOX_COMMITMENT"
  | "ATS_REQUIRES_FUNDTRACKER_ACTOR"
  | "ATS_ALREADY_EMITTED";

export interface LiveRailAuthority {
  readonly __brand: "LIVE_RAIL_AUTHORITY";
  mayConnectLiveRails: true;
}

export interface LivePaymentProcessingAuthority {
  readonly __brand: "LIVE_PAYMENT_PROCESSING_AUTHORITY";
  mayProcessLivePayment: true;
}

export interface GTISWriteAuthority {
  readonly __brand: "GTIS_WRITE_AUTHORITY";
  mayWriteFundTrackerState: true;
}

export interface PaiSafeAuthority {
  readonly __brand: "PAI_SAFE_AUTHORITY";
  mayCreateTransactionTruth: true;
}

export interface FinTechionCommandAuthority {
  readonly __brand: "FINTECHIONAI_COMMAND_AUTHORITY";
  mayCommandTransactionTruth: true;
}

export interface LiveActivatedTransactionState {
  readonly __brand: "LIVE_ACTIVATED_TRANSACTION_STATE";
  liveAtsId: string;
  liveAuthority: true;
}

export interface SandboxProcessorEvent {
  readonly __brand: "SANDBOX_PROCESSOR_EVENT";
  eventRef: string;
  transactionRef: string;
  eventKind: SandboxProcessorEventKind;
  amountCents: number;
  currency: "USD";
  sandboxOnly: true;
  liveRail: false;
  livePayment: false;
  createdAt: string;
  expiresAt: string;
  replayNonce: string;
}

export interface SandboxVerifiedOpportunity {
  readonly __brand: "SANDBOX_VERIFIED_OPPORTUNITY";
  verifiedOpportunityRef: string;
  transactionRef: string;
  sandboxOnly: true;
  createdAt: string;
}

export interface SandboxActivatedTransactionState {
  readonly __brand: "SANDBOX_ACTIVATED_TRANSACTION_STATE";
  atsRef: string;
  transactionRef: string;
  fundTrackerDecisionRef: string;
  verifiedOpportunityRef: string;
  processorEventRef: string;
  emittedBy: "FundTrackerAI";
  sandboxOnly: true;
  liveAts: false;
  createdAt: string;
}

export interface SandboxTransactionRecord {
  readonly __brand: "FUNDTRACKERAI_SANDBOX_TRANSACTION_RECORD";
  transactionRef: string;
  status: SandboxTransactionStatus;
  verifiedOpportunityRef?: string;
  processorEventRef?: string;
  fundTrackerDecisionRef?: string;
  sandboxAtsRef?: string;
  replayNonces: string[];
  refusalCodes: SandboxRefusalCode[];
  history: Array<{
    at: string;
    event: string;
    status: SandboxTransactionStatus;
    refusalCodes: SandboxRefusalCode[];
  }>;
  boundary: {
    sandboxOnly: true;
    fundTrackerAIIsTruthAuthority: true;
    processorEventIsNotAuthority: true;
    gtisHasNoWriteAuthority: true;
    paiSafeHasNoAuthority: true;
    fintechionAIHasNoCommandAuthority: true;
    noLiveRailsCreated: true;
    noLivePaymentProcessingCreated: true;
    noLiveATSCreated: true;
  };
}

export interface SandboxEvaluationInput {
  actor: "FundTrackerAI" | "GTIS" | "PAI_SAFE" | "FinTechionAI" | "UNKNOWN";
  now: string;
  existingRecord?: SandboxTransactionRecord;
  verifiedOpportunity?: SandboxVerifiedOpportunity;
  processorEvent?: SandboxProcessorEvent;
  requestedDecision: SandboxFundTrackerDecision;
}

export interface SandboxEvaluationResult {
  status:
    | "SANDBOX_TRANSACTION_MUTATION_APPLIED"
    | "SANDBOX_TRANSACTION_MUTATION_REFUSED"
    | "SANDBOX_ATS_EMITTED"
    | "SANDBOX_ATS_REFUSED";
  record: SandboxTransactionRecord;
  emittedATS?: SandboxActivatedTransactionState;
  refusalCodes: SandboxRefusalCode[];
  boundary: {
    resultCreatesNoLiveRails: true;
    resultCreatesNoLivePaymentProcessing: true;
    resultCreatesNoLiveTransactionTruth: true;
    resultCreatesNoLiveATS: true;
    resultCreatesNoCustodyTransfer: true;
    resultCreatesNoRuntimeActivation: true;
    sandboxAuthorityOnly: true;
  };
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function isExpired(now: string, expiresAt: string): boolean {
  return new Date(now).getTime() > new Date(expiresAt).getTime();
}

function createEmptyRecord(transactionRef: string): SandboxTransactionRecord {
  return {
    __brand: "FUNDTRACKERAI_SANDBOX_TRANSACTION_RECORD",
    transactionRef,
    status: "SANDBOX_TRANSACTION_NOT_STARTED",
    replayNonces: [],
    refusalCodes: [],
    history: [],
    boundary: {
      sandboxOnly: true,
      fundTrackerAIIsTruthAuthority: true,
      processorEventIsNotAuthority: true,
      gtisHasNoWriteAuthority: true,
      paiSafeHasNoAuthority: true,
      fintechionAIHasNoCommandAuthority: true,
      noLiveRailsCreated: true,
      noLivePaymentProcessingCreated: true,
      noLiveATSCreated: true
    }
  };
}

function appendHistory(
  record: SandboxTransactionRecord,
  now: string,
  event: string,
  status: SandboxTransactionStatus,
  refusalCodes: SandboxRefusalCode[]
): SandboxTransactionRecord {
  return {
    ...record,
    status,
    refusalCodes: unique([...record.refusalCodes, ...refusalCodes]),
    history: [
      ...record.history,
      {
        at: now,
        event,
        status,
        refusalCodes: unique(refusalCodes)
      }
    ]
  };
}

function validateSandboxInput(input: SandboxEvaluationInput): SandboxRefusalCode[] {
  const refusals: SandboxRefusalCode[] = [];

  if (input.actor !== "FundTrackerAI") {
    refusals.push("ATS_REQUIRES_FUNDTRACKER_ACTOR");
  }

  if (!input.verifiedOpportunity || !hasText(input.verifiedOpportunity.verifiedOpportunityRef)) {
    refusals.push("MISSING_VERIFIED_OPPORTUNITY_REF");
  }

  if (!input.processorEvent || !hasText(input.processorEvent.eventRef)) {
    refusals.push("MISSING_SANDBOX_PROCESSOR_EVENT_REF");
  }

  if (input.processorEvent) {
    if (input.processorEvent.sandboxOnly !== true) refusals.push("NON_SANDBOX_EVENT_REFUSED");
    if (input.processorEvent.liveRail !== false) refusals.push("LIVE_RAIL_EVENT_REFUSED");
    if (input.processorEvent.livePayment !== false) refusals.push("LIVE_PAYMENT_REFUSED");
    if (isExpired(input.now, input.processorEvent.expiresAt)) refusals.push("STALE_EVENT_REFUSED");

    const existingNonces = input.existingRecord?.replayNonces ?? [];
    if (existingNonces.includes(input.processorEvent.replayNonce)) {
      refusals.push("REPLAY_EVENT_REFUSED");
    }

    if (input.processorEvent.eventKind === "SANDBOX_PROCESSOR_EVENT_DUPLICATE") {
      refusals.push("DUPLICATE_EVENT_REFUSED");
    }

    if (input.processorEvent.eventKind === "SANDBOX_PROCESSOR_EVENT_REPLAY") {
      refusals.push("REPLAY_EVENT_REFUSED");
    }

    if (input.processorEvent.eventKind === "SANDBOX_PROCESSOR_EVENT_STALE") {
      refusals.push("STALE_EVENT_REFUSED");
    }

    if (input.processorEvent.eventKind === "SANDBOX_PROCESSOR_EVENT_PARTIAL") {
      refusals.push("PARTIAL_PAYMENT_REFUSED");
    }

    if (input.processorEvent.eventKind === "SANDBOX_PROCESSOR_EVENT_FAILED") {
      refusals.push("FAILED_PROCESSOR_EVENT_REFUSED");
    }
  }

  return unique(refusals);
}

export function evaluateSandboxTransactionAuthority(
  input: SandboxEvaluationInput
): SandboxEvaluationResult {
  const transactionRef =
    input.processorEvent?.transactionRef ??
    input.verifiedOpportunity?.transactionRef ??
    input.existingRecord?.transactionRef ??
    "sandbox_transaction_unknown";

  const baseRecord = input.existingRecord ?? createEmptyRecord(transactionRef);
  const baseRefusals = validateSandboxInput(input);

  const processorEventRef = input.processorEvent?.eventRef;
  const verifiedOpportunityRef = input.verifiedOpportunity?.verifiedOpportunityRef;

  if (baseRefusals.length > 0) {
    const refusedRecord = appendHistory(
      {
        ...baseRecord,
        ...(processorEventRef ? { processorEventRef } : {}),
        ...(verifiedOpportunityRef ? { verifiedOpportunityRef } : {})
      },
      input.now,
      "SANDBOX_AUTHORITY_REFUSAL",
      "SANDBOX_TRANSACTION_REFUSED",
      baseRefusals
    );

    return {
      status: input.requestedDecision === "EMIT_SANDBOX_ATS" ? "SANDBOX_ATS_REFUSED" : "SANDBOX_TRANSACTION_MUTATION_REFUSED",
      record: refusedRecord,
      refusalCodes: baseRefusals,
      boundary: {
        resultCreatesNoLiveRails: true,
        resultCreatesNoLivePaymentProcessing: true,
        resultCreatesNoLiveTransactionTruth: true,
        resultCreatesNoLiveATS: true,
        resultCreatesNoCustodyTransfer: true,
        resultCreatesNoRuntimeActivation: true,
        sandboxAuthorityOnly: true
      }
    };
  }

  if (!processorEventRef || !verifiedOpportunityRef || !input.processorEvent || !input.verifiedOpportunity) {
    throw new Error("INTERNAL_SANDBOX_VALIDATION_INVARIANT_FAILED");
  }

  const fundTrackerDecisionRef = `ft_sandbox_decision_${transactionRef}`;

  const nextRecordBase: SandboxTransactionRecord = {
    ...baseRecord,
    transactionRef,
    verifiedOpportunityRef,
    processorEventRef,
    fundTrackerDecisionRef,
    replayNonces: unique([...baseRecord.replayNonces, input.processorEvent.replayNonce])
  };

  if (input.requestedDecision === "HOLD_SANDBOX_COMMITMENT") {
    return {
      status: "SANDBOX_TRANSACTION_MUTATION_APPLIED",
      record: appendHistory(
        nextRecordBase,
        input.now,
        "SANDBOX_COMMITMENT_HELD",
        "SANDBOX_TRANSACTION_HELD",
        []
      ),
      refusalCodes: [],
      boundary: {
        resultCreatesNoLiveRails: true,
        resultCreatesNoLivePaymentProcessing: true,
        resultCreatesNoLiveTransactionTruth: true,
        resultCreatesNoLiveATS: true,
        resultCreatesNoCustodyTransfer: true,
        resultCreatesNoRuntimeActivation: true,
        sandboxAuthorityOnly: true
      }
    };
  }

  if (input.requestedDecision === "REFUSE_SANDBOX_COMMITMENT") {
    return {
      status: "SANDBOX_TRANSACTION_MUTATION_APPLIED",
      record: appendHistory(
        nextRecordBase,
        input.now,
        "SANDBOX_COMMITMENT_REFUSED",
        "SANDBOX_TRANSACTION_REFUSED",
        ["PROCESSOR_EVENT_NOT_AUTHORITY"]
      ),
      refusalCodes: ["PROCESSOR_EVENT_NOT_AUTHORITY"],
      boundary: {
        resultCreatesNoLiveRails: true,
        resultCreatesNoLivePaymentProcessing: true,
        resultCreatesNoLiveTransactionTruth: true,
        resultCreatesNoLiveATS: true,
        resultCreatesNoCustodyTransfer: true,
        resultCreatesNoRuntimeActivation: true,
        sandboxAuthorityOnly: true
      }
    };
  }

  if (input.requestedDecision === "VERIFY_SANDBOX_COMMITMENT") {
    return {
      status: "SANDBOX_TRANSACTION_MUTATION_APPLIED",
      record: appendHistory(
        nextRecordBase,
        input.now,
        "SANDBOX_COMMITMENT_VERIFIED",
        "SANDBOX_TRANSACTION_VERIFIED",
        []
      ),
      refusalCodes: [],
      boundary: {
        resultCreatesNoLiveRails: true,
        resultCreatesNoLivePaymentProcessing: true,
        resultCreatesNoLiveTransactionTruth: true,
        resultCreatesNoLiveATS: true,
        resultCreatesNoCustodyTransfer: true,
        resultCreatesNoRuntimeActivation: true,
        sandboxAuthorityOnly: true
      }
    };
  }

  if (input.requestedDecision === "EMIT_SANDBOX_ATS") {
    if (baseRecord.sandboxAtsRef) {
      const refused = appendHistory(
        nextRecordBase,
        input.now,
        "SANDBOX_ATS_DUPLICATE_REFUSED",
        baseRecord.status,
        ["ATS_ALREADY_EMITTED"]
      );

      return {
        status: "SANDBOX_ATS_REFUSED",
        record: refused,
        refusalCodes: ["ATS_ALREADY_EMITTED"],
        boundary: {
          resultCreatesNoLiveRails: true,
          resultCreatesNoLivePaymentProcessing: true,
          resultCreatesNoLiveTransactionTruth: true,
          resultCreatesNoLiveATS: true,
          resultCreatesNoCustodyTransfer: true,
          resultCreatesNoRuntimeActivation: true,
          sandboxAuthorityOnly: true
        }
      };
    }

    if (baseRecord.status !== "SANDBOX_TRANSACTION_VERIFIED") {
      const refused = appendHistory(
        nextRecordBase,
        input.now,
        "SANDBOX_ATS_EMISSION_REFUSED_NOT_VERIFIED",
        "SANDBOX_TRANSACTION_REFUSED",
        ["ATS_REQUIRES_VERIFIED_SANDBOX_COMMITMENT"]
      );

      return {
        status: "SANDBOX_ATS_REFUSED",
        record: refused,
        refusalCodes: ["ATS_REQUIRES_VERIFIED_SANDBOX_COMMITMENT"],
        boundary: {
          resultCreatesNoLiveRails: true,
          resultCreatesNoLivePaymentProcessing: true,
          resultCreatesNoLiveTransactionTruth: true,
          resultCreatesNoLiveATS: true,
          resultCreatesNoCustodyTransfer: true,
          resultCreatesNoRuntimeActivation: true,
          sandboxAuthorityOnly: true
        }
      };
    }

    const ats: SandboxActivatedTransactionState = {
      __brand: "SANDBOX_ACTIVATED_TRANSACTION_STATE",
      atsRef: `sandbox_ats_${transactionRef}`,
      transactionRef,
      fundTrackerDecisionRef: baseRecord.fundTrackerDecisionRef ?? fundTrackerDecisionRef,
      verifiedOpportunityRef,
      processorEventRef,
      emittedBy: "FundTrackerAI",
      sandboxOnly: true,
      liveAts: false,
      createdAt: input.now
    };

    const activatedRecord = appendHistory(
      {
        ...nextRecordBase,
        sandboxAtsRef: ats.atsRef
      },
      input.now,
      "SANDBOX_ATS_EMITTED",
      "SANDBOX_TRANSACTION_ACTIVATED",
      []
    );

    return {
      status: "SANDBOX_ATS_EMITTED",
      record: activatedRecord,
      emittedATS: ats,
      refusalCodes: [],
      boundary: {
        resultCreatesNoLiveRails: true,
        resultCreatesNoLivePaymentProcessing: true,
        resultCreatesNoLiveTransactionTruth: true,
        resultCreatesNoLiveATS: true,
        resultCreatesNoCustodyTransfer: true,
        resultCreatesNoRuntimeActivation: true,
        sandboxAuthorityOnly: true
      }
    };
  }

  throw new Error("UNREACHABLE_SANDBOX_DECISION");
}

export function buildSandboxProcessorSuccessEvent(transactionRef: string): SandboxProcessorEvent {
  return {
    __brand: "SANDBOX_PROCESSOR_EVENT",
    eventRef: `sandbox_processor_event_${transactionRef}`,
    transactionRef,
    eventKind: "SANDBOX_PROCESSOR_EVENT_SUCCESS",
    amountCents: 100,
    currency: "USD",
    sandboxOnly: true,
    liveRail: false,
    livePayment: false,
    createdAt: "2026-04-28T00:00:00.000Z",
    expiresAt: "2026-04-28T01:00:00.000Z",
    replayNonce: `nonce_${transactionRef}`
  };
}

export function buildSandboxVerifiedOpportunity(transactionRef: string): SandboxVerifiedOpportunity {
  return {
    __brand: "SANDBOX_VERIFIED_OPPORTUNITY",
    verifiedOpportunityRef: `sandbox_verified_opportunity_${transactionRef}`,
    transactionRef,
    sandboxOnly: true,
    createdAt: "2026-04-28T00:00:00.000Z"
  };
}

export const FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY_DOCTRINE = {
  name: "FundTrackerAI Sandbox Transaction Authority",
  class: "SANDBOX_TRANSACTION_TRUTH_AND_ATS_AUTHORITY",
  purpose:
    "Enable FundTrackerAI to mutate sandbox transaction state and emit sandbox-only ATS under verified sandbox conditions while creating no live rails, live payment processing, live ATS, or public launch authority.",
  boundary: {
    sandboxOnly: true,
    fundTrackerAIIsTruthAuthority: true,
    processorEventIsNotAuthority: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noLiveATSCreated: true,
    noRuntimeActivationCreated: true,
    gtisHasNoWriteAuthority: true,
    paiSafeHasNoAuthority: true,
    fintechionAIHasNoCommandAuthority: true
  }
} as const;
