import {
  evaluateSandboxTransactionAuthority
} from "../fundtrackerai-sandbox-transaction-authority";

import type {
  SandboxEvaluationResult,
  SandboxProcessorEvent,
  SandboxProcessorEventKind,
  SandboxVerifiedOpportunity
} from "../fundtrackerai-sandbox-transaction-authority";

export type SandboxRailAdapterStatus =
  | "SANDBOX_RAIL_ADAPTER_ACCEPTED"
  | "SANDBOX_RAIL_ADAPTER_REFUSED";

export type SandboxRailProvider =
  | "STRIPE_SANDBOX"
  | "PAYPAL_SANDBOX"
  | "ACH_SANDBOX"
  | "BANK_TRANSFER_MANUAL_SANDBOX"
  | "UNKNOWN_SANDBOX_PROVIDER";

export type RawSandboxRailEventKind =
  | "payment_intent.processing"
  | "payment_intent.succeeded"
  | "payment_intent.payment_failed"
  | "payment_intent.duplicate"
  | "payment_intent.partial"
  | "payment_intent.replay"
  | "payment_intent.stale"
  | "manual_bank_transfer.pending"
  | "manual_bank_transfer.confirmed"
  | "unknown";

export type SandboxRailAdapterRefusalCode =
  | "LIVE_RAIL_PAYLOAD_REFUSED"
  | "LIVE_PAYMENT_PAYLOAD_REFUSED"
  | "NON_SANDBOX_PROVIDER_REFUSED"
  | "MISSING_TRANSACTION_REF"
  | "MISSING_EVENT_REF"
  | "MISSING_REPLAY_NONCE"
  | "MISSING_AMOUNT"
  | "UNSUPPORTED_CURRENCY"
  | "MALFORMED_TIMESTAMP"
  | "EXPIRED_AT_BEFORE_CREATED_AT"
  | "UNKNOWN_EVENT_KIND_REFUSED"
  | "PAYLOAD_CANNOT_MUTATE_STATE"
  | "PAYLOAD_CANNOT_CREATE_ATS"
  | "PAYLOAD_CANNOT_PROCESS_PAYMENT";

export interface LiveRailConnectionAuthority {
  readonly __brand: "LIVE_RAIL_CONNECTION_AUTHORITY";
  mayConnectLiveRail: true;
}

export interface LivePaymentProcessingAuthority {
  readonly __brand: "LIVE_PAYMENT_PROCESSING_AUTHORITY";
  mayProcessLivePayment: true;
}

export interface FundTrackerMutationAuthority {
  readonly __brand: "FUNDTRACKER_MUTATION_AUTHORITY";
  mayMutateFundTrackerState: true;
}

export interface ActivatedTransactionStateEmissionAuthority {
  readonly __brand: "ATS_EMISSION_AUTHORITY";
  mayEmitATS: true;
}

export interface RawSandboxRailPayload {
  readonly __brand: "RAW_SANDBOX_RAIL_PAYLOAD";
  provider: SandboxRailProvider | "STRIPE_LIVE" | "PAYPAL_LIVE" | "ACH_LIVE";
  rawEventKind: RawSandboxRailEventKind;
  transactionRef?: string;
  eventRef?: string;
  replayNonce?: string;
  amountCents?: number;
  currency?: string;
  createdAt?: string;
  expiresAt?: string;
  sandboxOnly: boolean;
  liveRail: boolean;
  livePayment: boolean;
  attemptsToMutateState?: boolean;
  attemptsToCreateATS?: boolean;
  attemptsToProcessPayment?: boolean;
}

export interface SandboxRailAdapterAcceptedEvent {
  readonly __brand: "SANDBOX_RAIL_ADAPTER_ACCEPTED_EVENT";
  adapterEventRef: string;
  provider: SandboxRailProvider;
  normalizedEvent: SandboxProcessorEvent;
  verifiedOpportunity: SandboxVerifiedOpportunity;
  boundary: {
    acceptedEventIsSandboxOnly: true;
    processorEventIsNotAuthority: true;
    adapterDoesNotMutateFundTrackerState: true;
    adapterDoesNotEmitATS: true;
    adapterDoesNotProcessPayment: true;
    adapterCreatesNoLiveRails: true;
    adapterCreatesNoLiveTransactionTruth: true;
  };
}

export interface SandboxRailAdapterResult {
  readonly __brand: "SANDBOX_RAIL_ADAPTER_RESULT";
  status: SandboxRailAdapterStatus;
  acceptedEvent?: SandboxRailAdapterAcceptedEvent;
  refusalCodes: SandboxRailAdapterRefusalCode[];
  boundary: {
    adapterCreatesNoLiveRails: true;
    adapterCreatesNoLivePaymentProcessing: true;
    adapterCreatesNoTransactionTruth: true;
    adapterCreatesNoTransactionMutation: true;
    adapterCreatesNoATS: true;
    adapterCreatesNoCustodyTransfer: true;
    adapterCreatesNoRuntimeActivation: true;
    adapterIsIntakeOnly: true;
  };
}

export interface SandboxRailHarnessResult {
  readonly __brand: "SANDBOX_RAIL_HARNESS_RESULT";
  status: "SANDBOX_RAIL_ADAPTER_HARNESS_READY" | "SANDBOX_RAIL_ADAPTER_HARNESS_BLOCKED";
  intakeResult: SandboxRailAdapterResult;
  fundTrackerHandoff?: SandboxEvaluationResult;
  boundary: {
    harnessCreatesNoLiveRails: true;
    harnessCreatesNoLivePaymentProcessing: true;
    harnessCreatesNoLiveTransactionTruth: true;
    harnessDoesNotBypassFundTrackerAI: true;
    harnessDoesNotEmitATSDirectly: true;
    sandboxOnly: true;
  };
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function isValidIsoDate(value: string | undefined): value is string {
  if (!hasText(value)) return false;
  const time = new Date(value).getTime();
  return !Number.isNaN(time);
}

function isSandboxProvider(provider: RawSandboxRailPayload["provider"]): provider is SandboxRailProvider {
  return (
    provider === "STRIPE_SANDBOX" ||
    provider === "PAYPAL_SANDBOX" ||
    provider === "ACH_SANDBOX" ||
    provider === "BANK_TRANSFER_MANUAL_SANDBOX" ||
    provider === "UNKNOWN_SANDBOX_PROVIDER"
  );
}

function mapRawKindToSandboxProcessorKind(kind: RawSandboxRailEventKind): SandboxProcessorEventKind | null {
  if (kind === "payment_intent.processing" || kind === "manual_bank_transfer.pending") {
    return "SANDBOX_PROCESSOR_EVENT_PENDING";
  }

  if (kind === "payment_intent.succeeded" || kind === "manual_bank_transfer.confirmed") {
    return "SANDBOX_PROCESSOR_EVENT_SUCCESS";
  }

  if (kind === "payment_intent.payment_failed") {
    return "SANDBOX_PROCESSOR_EVENT_FAILED";
  }

  if (kind === "payment_intent.duplicate") {
    return "SANDBOX_PROCESSOR_EVENT_DUPLICATE";
  }

  if (kind === "payment_intent.partial") {
    return "SANDBOX_PROCESSOR_EVENT_PARTIAL";
  }

  if (kind === "payment_intent.replay") {
    return "SANDBOX_PROCESSOR_EVENT_REPLAY";
  }

  if (kind === "payment_intent.stale") {
    return "SANDBOX_PROCESSOR_EVENT_STALE";
  }

  return null;
}

export function adaptSandboxRailPayload(payload: RawSandboxRailPayload): SandboxRailAdapterResult {
  const refusalCodes: SandboxRailAdapterRefusalCode[] = [];

  if (!isSandboxProvider(payload.provider)) refusalCodes.push("NON_SANDBOX_PROVIDER_REFUSED");
  if (payload.liveRail !== false) refusalCodes.push("LIVE_RAIL_PAYLOAD_REFUSED");
  if (payload.livePayment !== false) refusalCodes.push("LIVE_PAYMENT_PAYLOAD_REFUSED");
  if (payload.sandboxOnly !== true) refusalCodes.push("NON_SANDBOX_PROVIDER_REFUSED");

  if (!hasText(payload.transactionRef)) refusalCodes.push("MISSING_TRANSACTION_REF");
  if (!hasText(payload.eventRef)) refusalCodes.push("MISSING_EVENT_REF");
  if (!hasText(payload.replayNonce)) refusalCodes.push("MISSING_REPLAY_NONCE");
  if (typeof payload.amountCents !== "number" || !Number.isFinite(payload.amountCents) || payload.amountCents <= 0) {
    refusalCodes.push("MISSING_AMOUNT");
  }
  if (payload.currency !== "USD") refusalCodes.push("UNSUPPORTED_CURRENCY");
  if (!isValidIsoDate(payload.createdAt) || !isValidIsoDate(payload.expiresAt)) refusalCodes.push("MALFORMED_TIMESTAMP");

  if (isValidIsoDate(payload.createdAt) && isValidIsoDate(payload.expiresAt)) {
    if (new Date(payload.expiresAt).getTime() <= new Date(payload.createdAt).getTime()) {
      refusalCodes.push("EXPIRED_AT_BEFORE_CREATED_AT");
    }
  }

  const mappedKind = mapRawKindToSandboxProcessorKind(payload.rawEventKind);
  if (!mappedKind) refusalCodes.push("UNKNOWN_EVENT_KIND_REFUSED");

  if (payload.attemptsToMutateState === true) refusalCodes.push("PAYLOAD_CANNOT_MUTATE_STATE");
  if (payload.attemptsToCreateATS === true) refusalCodes.push("PAYLOAD_CANNOT_CREATE_ATS");
  if (payload.attemptsToProcessPayment === true) refusalCodes.push("PAYLOAD_CANNOT_PROCESS_PAYMENT");

  const cleanRefusals = unique(refusalCodes);

  if (cleanRefusals.length > 0 || !mappedKind || !hasText(payload.transactionRef) || !hasText(payload.eventRef) || !hasText(payload.replayNonce) || typeof payload.amountCents !== "number" || !payload.createdAt || !payload.expiresAt || !isSandboxProvider(payload.provider)) {
    return {
      __brand: "SANDBOX_RAIL_ADAPTER_RESULT",
      status: "SANDBOX_RAIL_ADAPTER_REFUSED",
      refusalCodes: cleanRefusals,
      boundary: {
        adapterCreatesNoLiveRails: true,
        adapterCreatesNoLivePaymentProcessing: true,
        adapterCreatesNoTransactionTruth: true,
        adapterCreatesNoTransactionMutation: true,
        adapterCreatesNoATS: true,
        adapterCreatesNoCustodyTransfer: true,
        adapterCreatesNoRuntimeActivation: true,
        adapterIsIntakeOnly: true
      }
    };
  }

  const normalizedEvent: SandboxProcessorEvent = {
    __brand: "SANDBOX_PROCESSOR_EVENT",
    eventRef: payload.eventRef,
    transactionRef: payload.transactionRef,
    eventKind: mappedKind,
    amountCents: payload.amountCents,
    currency: "USD",
    sandboxOnly: true,
    liveRail: false,
    livePayment: false,
    createdAt: payload.createdAt,
    expiresAt: payload.expiresAt,
    replayNonce: payload.replayNonce
  };

  const verifiedOpportunity: SandboxVerifiedOpportunity = {
    __brand: "SANDBOX_VERIFIED_OPPORTUNITY",
    verifiedOpportunityRef: `sandbox_verified_opportunity_${payload.transactionRef}`,
    transactionRef: payload.transactionRef,
    sandboxOnly: true,
    createdAt: payload.createdAt
  };

  return {
    __brand: "SANDBOX_RAIL_ADAPTER_RESULT",
    status: "SANDBOX_RAIL_ADAPTER_ACCEPTED",
    acceptedEvent: {
      __brand: "SANDBOX_RAIL_ADAPTER_ACCEPTED_EVENT",
      adapterEventRef: `sandbox_adapter_${payload.eventRef}`,
      provider: payload.provider,
      normalizedEvent,
      verifiedOpportunity,
      boundary: {
        acceptedEventIsSandboxOnly: true,
        processorEventIsNotAuthority: true,
        adapterDoesNotMutateFundTrackerState: true,
        adapterDoesNotEmitATS: true,
        adapterDoesNotProcessPayment: true,
        adapterCreatesNoLiveRails: true,
        adapterCreatesNoLiveTransactionTruth: true
      }
    },
    refusalCodes: [],
    boundary: {
      adapterCreatesNoLiveRails: true,
      adapterCreatesNoLivePaymentProcessing: true,
      adapterCreatesNoTransactionTruth: true,
      adapterCreatesNoTransactionMutation: true,
      adapterCreatesNoATS: true,
      adapterCreatesNoCustodyTransfer: true,
      adapterCreatesNoRuntimeActivation: true,
      adapterIsIntakeOnly: true
    }
  };
}

export function runSandboxRailAdapterHarness(payload: RawSandboxRailPayload): SandboxRailHarnessResult {
  const intakeResult = adaptSandboxRailPayload(payload);

  if (intakeResult.status !== "SANDBOX_RAIL_ADAPTER_ACCEPTED" || !intakeResult.acceptedEvent) {
    return {
      __brand: "SANDBOX_RAIL_HARNESS_RESULT",
      status: "SANDBOX_RAIL_ADAPTER_HARNESS_BLOCKED",
      intakeResult,
      boundary: {
        harnessCreatesNoLiveRails: true,
        harnessCreatesNoLivePaymentProcessing: true,
        harnessCreatesNoLiveTransactionTruth: true,
        harnessDoesNotBypassFundTrackerAI: true,
        harnessDoesNotEmitATSDirectly: true,
        sandboxOnly: true
      }
    };
  }

  const fundTrackerHandoff = evaluateSandboxTransactionAuthority({
    actor: "FundTrackerAI",
    now: payload.createdAt ?? new Date().toISOString(),
    verifiedOpportunity: intakeResult.acceptedEvent.verifiedOpportunity,
    processorEvent: intakeResult.acceptedEvent.normalizedEvent,
    requestedDecision: "VERIFY_SANDBOX_COMMITMENT"
  });

  return {
    __brand: "SANDBOX_RAIL_HARNESS_RESULT",
    status:
      fundTrackerHandoff.status === "SANDBOX_TRANSACTION_MUTATION_APPLIED"
        ? "SANDBOX_RAIL_ADAPTER_HARNESS_READY"
        : "SANDBOX_RAIL_ADAPTER_HARNESS_BLOCKED",
    intakeResult,
    fundTrackerHandoff,
    boundary: {
      harnessCreatesNoLiveRails: true,
      harnessCreatesNoLivePaymentProcessing: true,
      harnessCreatesNoLiveTransactionTruth: true,
      harnessDoesNotBypassFundTrackerAI: true,
      harnessDoesNotEmitATSDirectly: true,
      sandboxOnly: true
    }
  };
}

export function buildValidStripeSandboxPayload(transactionRef: string): RawSandboxRailPayload {
  return {
    __brand: "RAW_SANDBOX_RAIL_PAYLOAD",
    provider: "STRIPE_SANDBOX",
    rawEventKind: "payment_intent.succeeded",
    transactionRef,
    eventRef: `stripe_sandbox_evt_${transactionRef}`,
    replayNonce: `stripe_sandbox_nonce_${transactionRef}`,
    amountCents: 100,
    currency: "USD",
    createdAt: "2026-04-28T00:00:00.000Z",
    expiresAt: "2026-04-28T01:00:00.000Z",
    sandboxOnly: true,
    liveRail: false,
    livePayment: false,
    attemptsToMutateState: false,
    attemptsToCreateATS: false,
    attemptsToProcessPayment: false
  };
}

export const SANDBOX_RAIL_ADAPTER_HARNESS_DOCTRINE = {
  name: "Sandbox Rail Adapter Harness / Sandbox Processor Event Intake",
  class: "SANDBOX_PROCESSOR_EVENT_INTAKE_LAYER",
  purpose:
    "Normalize sandbox rail payloads into sandbox processor events for FundTrackerAI evaluation while refusing live rails, malformed payloads, mutation attempts, ATS creation attempts, and payment-processing attempts.",
  boundary: {
    adapterIsIntakeOnly: true,
    sandboxOnly: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noTransactionTruthCreated: true,
    noTransactionMutationCreated: true,
    noATSCreated: true,
    fundTrackerAIStillEvaluatesTruth: true
  }
} as const;
