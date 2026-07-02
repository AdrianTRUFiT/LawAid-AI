import {
  buildValidSandboxTrustSpinePayload,
  runSandboxTrustSpineConsolidation,
  verifySandboxEvidenceLedgerChain
} from "../sandbox-trust-spine-consolidation";

import type {
  SandboxEvidenceLedgerRecord,
  SandboxTrustSpineConsolidationResult
} from "../sandbox-trust-spine-consolidation";

import type {
  RawSandboxRailPayload
} from "../sandbox-rail-adapter-harness";

export type ControlledReplaySuiteStatus =
  | "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_READY"
  | "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_BLOCKED"
  | "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_REFUSED";

export type ReplayScenarioKind =
  | "VALID_SANDBOX"
  | "DUPLICATE_TRANSACTION"
  | "REPLAY_NONCE"
  | "STALE_EVENT"
  | "LIVE_RAIL_ATTEMPT"
  | "MUTATION_ATTEMPT"
  | "MISSING_TRANSACTION_REF"
  | "MISSING_EVENT_REF"
  | "MISSING_REPLAY_NONCE"
  | "PARTIAL_PAYMENT"
  | "FAILED_PAYMENT"
  | "TAMPERED_LEDGER_CHAIN";

export type ReplayExpectedOutcome =
  | "READY"
  | "REFUSED_AT_INTAKE"
  | "REFUSED_AT_FUNDTRACKER"
  | "REFUSED_AT_TRUST_SPINE"
  | "REFUSED_BY_LEDGER_CHAIN";

export type ReplayObservedOutcome =
  | "READY"
  | "REFUSED"
  | "CHAIN_REFUSED";

export type ReplaySuiteRefusalCode =
  | "REPLAY_EXPECTATION_MISMATCH"
  | "VALID_SCENARIO_FAILED"
  | "INVALID_SCENARIO_ESCAPED"
  | "LEDGER_CHAIN_EXPECTED_REFUSAL_NOT_DETECTED"
  | "LEDGER_CHAIN_UNEXPECTED_REFUSAL"
  | "LIVE_CAPABILITY_LEAK_REFUSED"
  | "REPLAY_BATCH_EMPTY"
  | "SUMMARY_SCORE_BELOW_THRESHOLD";

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

export interface RuntimeActivationAuthority {
  readonly __brand: "RUNTIME_ACTIVATION_AUTHORITY";
  mayActivateRuntime: true;
}

export interface ControlledReplayScenario {
  readonly __brand: "CONTROLLED_REPLAY_SCENARIO";
  scenarioId: string;
  kind: ReplayScenarioKind;
  expectedOutcome: ReplayExpectedOutcome;
  payload: RawSandboxRailPayload;
  tampersLedgerAfterRun: boolean;
  boundary: {
    scenarioIsSandboxPressureOnly: true;
    scenarioCreatesNoLiveRails: true;
    scenarioCreatesNoPaymentProcessing: true;
    scenarioCreatesNoRuntimeActivation: true;
  };
}

export interface ControlledReplayScenarioResult {
  readonly __brand: "CONTROLLED_REPLAY_SCENARIO_RESULT";
  scenarioId: string;
  kind: ReplayScenarioKind;
  expectedOutcome: ReplayExpectedOutcome;
  observedOutcome: ReplayObservedOutcome;
  passed: boolean;
  trustSpineResult: SandboxTrustSpineConsolidationResult;
  ledgerRecord?: SandboxEvidenceLedgerRecord;
  ledgerChainValid: boolean;
  refusalCodes: ReplaySuiteRefusalCode[];
  diagnostic: string;
  boundary: {
    replayCreatesNoLiveRails: true;
    replayCreatesNoLivePaymentProcessing: true;
    replayCreatesNoLiveTransactionTruth: true;
    replayCreatesNoLiveATS: true;
    replayCreatesNoCustodyTransfer: true;
    replayCreatesNoRuntimeActivation: true;
    replayIsTestOnly: true;
  };
}

export interface ControlledReplaySummary {
  readonly __brand: "CONTROLLED_REPLAY_SUMMARY";
  total: number;
  passed: number;
  failed: number;
  validReadyCount: number;
  refusedCount: number;
  chainRefusedCount: number;
  liveAttemptsRefused: number;
  mutationAttemptsRefused: number;
  missingRefAttemptsRefused: number;
  score: number;
  refusalCodes: ReplaySuiteRefusalCode[];
  boundary: {
    summaryIsEvidenceOnly: true;
    summaryCreatesNoAuthority: true;
    summaryDoesNotAuthorizeLaunch: true;
    summaryDoesNotAuthorizeLiveRails: true;
  };
}

export interface ControlledSandboxTransactionReplaySuiteResult {
  readonly __brand: "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_RESULT";
  suiteId: string;
  status: ControlledReplaySuiteStatus;
  scenarioResults: ControlledReplayScenarioResult[];
  summary: ControlledReplaySummary;
  ledgerRecords: SandboxEvidenceLedgerRecord[];
  refusalCodes: ReplaySuiteRefusalCode[];
  boundary: {
    suiteIsSandboxOnly: true;
    noLiveRailsCreated: true;
    noLivePaymentProcessingCreated: true;
    noLiveTransactionTruthCreated: true;
    noLiveATSCreated: true;
    noCustodyTransferCreated: true;
    noRuntimeActivationCreated: true;
    replaySuiteIsNotLaunchApproval: true;
  };
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

function clonePayload(payload: RawSandboxRailPayload): RawSandboxRailPayload {
  return {
    ...payload
  };
}

function boundary(): ControlledReplayScenarioResult["boundary"] {
  return {
    replayCreatesNoLiveRails: true,
    replayCreatesNoLivePaymentProcessing: true,
    replayCreatesNoLiveTransactionTruth: true,
    replayCreatesNoLiveATS: true,
    replayCreatesNoCustodyTransfer: true,
    replayCreatesNoRuntimeActivation: true,
    replayIsTestOnly: true
  };
}

function scenarioBoundary(): ControlledReplayScenario["boundary"] {
  return {
    scenarioIsSandboxPressureOnly: true,
    scenarioCreatesNoLiveRails: true,
    scenarioCreatesNoPaymentProcessing: true,
    scenarioCreatesNoRuntimeActivation: true
  };
}

function expectedMatchesObserved(expected: ReplayExpectedOutcome, observed: ReplayObservedOutcome): boolean {
  if (expected === "READY") return observed === "READY";
  if (expected === "REFUSED_BY_LEDGER_CHAIN") return observed === "CHAIN_REFUSED";
  if (expected === "REFUSED_AT_INTAKE") return observed === "REFUSED";
  if (expected === "REFUSED_AT_FUNDTRACKER") return observed === "REFUSED";
  if (expected === "REFUSED_AT_TRUST_SPINE") return observed === "REFUSED";
  return false;
}

function scenarioFailureCodes(
  scenario: ControlledReplayScenario,
  observed: ReplayObservedOutcome,
  chainValid: boolean,
  trustStatus: SandboxTrustSpineConsolidationResult["status"]
): ReplaySuiteRefusalCode[] {
  const refusalCodes: ReplaySuiteRefusalCode[] = [];

  if (!expectedMatchesObserved(scenario.expectedOutcome, observed)) {
    refusalCodes.push("REPLAY_EXPECTATION_MISMATCH");

    if (scenario.expectedOutcome === "READY") {
      refusalCodes.push("VALID_SCENARIO_FAILED");
    } else {
      refusalCodes.push("INVALID_SCENARIO_ESCAPED");
    }
  }

  if (scenario.expectedOutcome === "READY" && trustStatus !== "SANDBOX_TRUST_SPINE_CONSOLIDATION_READY") {
    refusalCodes.push("VALID_SCENARIO_FAILED");
  }

  if (scenario.expectedOutcome !== "READY" && scenario.expectedOutcome !== "REFUSED_BY_LEDGER_CHAIN" && trustStatus === "SANDBOX_TRUST_SPINE_CONSOLIDATION_READY") {
    refusalCodes.push("INVALID_SCENARIO_ESCAPED");
  }

  if (scenario.expectedOutcome === "REFUSED_BY_LEDGER_CHAIN" && chainValid) {
    refusalCodes.push("LEDGER_CHAIN_EXPECTED_REFUSAL_NOT_DETECTED");
  }

  if (scenario.expectedOutcome === "READY" && !chainValid) {
    refusalCodes.push("LEDGER_CHAIN_UNEXPECTED_REFUSAL");
  }

  return unique(refusalCodes);
}

function hasLiveLeak(result: SandboxTrustSpineConsolidationResult): boolean {
  return !(
    result.boundary.noLiveRailsCreated === true &&
    result.boundary.noLivePaymentProcessingCreated === true &&
    result.boundary.noLiveTransactionTruthCreated === true &&
    result.boundary.noLiveATSCreated === true &&
    result.boundary.noCustodyTransferCreated === true &&
    result.boundary.noRuntimeActivationCreated === true
  );
}

export function buildControlledReplayScenarios(): ControlledReplayScenario[] {
  const validA = buildValidSandboxTrustSpinePayload("replay_valid_001");
  const validB = buildValidSandboxTrustSpinePayload("replay_valid_002");

  const duplicate = clonePayload(buildValidSandboxTrustSpinePayload("replay_duplicate_001"));
  duplicate.rawEventKind = "payment_intent.duplicate";

  const replayNonce = clonePayload(buildValidSandboxTrustSpinePayload("replay_nonce_001"));
  replayNonce.rawEventKind = "payment_intent.replay";

  const stale = clonePayload(buildValidSandboxTrustSpinePayload("replay_stale_001"));
  stale.rawEventKind = "payment_intent.stale";

  const liveRail = clonePayload(buildValidSandboxTrustSpinePayload("replay_live_001"));
  liveRail.provider = "STRIPE_LIVE";
  liveRail.sandboxOnly = false;
  liveRail.liveRail = true;
  liveRail.livePayment = true;

  const mutation = clonePayload(buildValidSandboxTrustSpinePayload("replay_mutation_001"));
  mutation.attemptsToMutateState = true;
  mutation.attemptsToCreateATS = true;
  mutation.attemptsToProcessPayment = true;

  const missingTransaction = clonePayload(buildValidSandboxTrustSpinePayload("replay_missing_txn_001"));
  delete missingTransaction.transactionRef;

  const missingEvent = clonePayload(buildValidSandboxTrustSpinePayload("replay_missing_event_001"));
  delete missingEvent.eventRef;

  const missingNonce = clonePayload(buildValidSandboxTrustSpinePayload("replay_missing_nonce_001"));
  delete missingNonce.replayNonce;

  const partial = clonePayload(buildValidSandboxTrustSpinePayload("replay_partial_001"));
  partial.rawEventKind = "payment_intent.partial";

  const failed = clonePayload(buildValidSandboxTrustSpinePayload("replay_failed_001"));
  failed.rawEventKind = "payment_intent.payment_failed";

  const tamperedLedger = buildValidSandboxTrustSpinePayload("replay_tamper_001");

  return [
    {
      __brand: "CONTROLLED_REPLAY_SCENARIO",
      scenarioId: "scenario_valid_001",
      kind: "VALID_SANDBOX",
      expectedOutcome: "READY",
      payload: validA,
      tampersLedgerAfterRun: false,
      boundary: scenarioBoundary()
    },
    {
      __brand: "CONTROLLED_REPLAY_SCENARIO",
      scenarioId: "scenario_valid_002",
      kind: "VALID_SANDBOX",
      expectedOutcome: "READY",
      payload: validB,
      tampersLedgerAfterRun: false,
      boundary: scenarioBoundary()
    },
    {
      __brand: "CONTROLLED_REPLAY_SCENARIO",
      scenarioId: "scenario_duplicate_001",
      kind: "DUPLICATE_TRANSACTION",
      expectedOutcome: "REFUSED_AT_FUNDTRACKER",
      payload: duplicate,
      tampersLedgerAfterRun: false,
      boundary: scenarioBoundary()
    },
    {
      __brand: "CONTROLLED_REPLAY_SCENARIO",
      scenarioId: "scenario_replay_nonce_001",
      kind: "REPLAY_NONCE",
      expectedOutcome: "REFUSED_AT_FUNDTRACKER",
      payload: replayNonce,
      tampersLedgerAfterRun: false,
      boundary: scenarioBoundary()
    },
    {
      __brand: "CONTROLLED_REPLAY_SCENARIO",
      scenarioId: "scenario_stale_001",
      kind: "STALE_EVENT",
      expectedOutcome: "REFUSED_AT_FUNDTRACKER",
      payload: stale,
      tampersLedgerAfterRun: false,
      boundary: scenarioBoundary()
    },
    {
      __brand: "CONTROLLED_REPLAY_SCENARIO",
      scenarioId: "scenario_live_001",
      kind: "LIVE_RAIL_ATTEMPT",
      expectedOutcome: "REFUSED_AT_INTAKE",
      payload: liveRail,
      tampersLedgerAfterRun: false,
      boundary: scenarioBoundary()
    },
    {
      __brand: "CONTROLLED_REPLAY_SCENARIO",
      scenarioId: "scenario_mutation_001",
      kind: "MUTATION_ATTEMPT",
      expectedOutcome: "REFUSED_AT_INTAKE",
      payload: mutation,
      tampersLedgerAfterRun: false,
      boundary: scenarioBoundary()
    },
    {
      __brand: "CONTROLLED_REPLAY_SCENARIO",
      scenarioId: "scenario_missing_transaction_001",
      kind: "MISSING_TRANSACTION_REF",
      expectedOutcome: "REFUSED_AT_INTAKE",
      payload: missingTransaction,
      tampersLedgerAfterRun: false,
      boundary: scenarioBoundary()
    },
    {
      __brand: "CONTROLLED_REPLAY_SCENARIO",
      scenarioId: "scenario_missing_event_001",
      kind: "MISSING_EVENT_REF",
      expectedOutcome: "REFUSED_AT_INTAKE",
      payload: missingEvent,
      tampersLedgerAfterRun: false,
      boundary: scenarioBoundary()
    },
    {
      __brand: "CONTROLLED_REPLAY_SCENARIO",
      scenarioId: "scenario_missing_nonce_001",
      kind: "MISSING_REPLAY_NONCE",
      expectedOutcome: "REFUSED_AT_INTAKE",
      payload: missingNonce,
      tampersLedgerAfterRun: false,
      boundary: scenarioBoundary()
    },
    {
      __brand: "CONTROLLED_REPLAY_SCENARIO",
      scenarioId: "scenario_partial_001",
      kind: "PARTIAL_PAYMENT",
      expectedOutcome: "REFUSED_AT_FUNDTRACKER",
      payload: partial,
      tampersLedgerAfterRun: false,
      boundary: scenarioBoundary()
    },
    {
      __brand: "CONTROLLED_REPLAY_SCENARIO",
      scenarioId: "scenario_failed_001",
      kind: "FAILED_PAYMENT",
      expectedOutcome: "REFUSED_AT_FUNDTRACKER",
      payload: failed,
      tampersLedgerAfterRun: false,
      boundary: scenarioBoundary()
    },
    {
      __brand: "CONTROLLED_REPLAY_SCENARIO",
      scenarioId: "scenario_tamper_001",
      kind: "TAMPERED_LEDGER_CHAIN",
      expectedOutcome: "REFUSED_BY_LEDGER_CHAIN",
      payload: tamperedLedger,
      tampersLedgerAfterRun: true,
      boundary: scenarioBoundary()
    }
  ];
}

export function runControlledReplayScenario(
  scenario: ControlledReplayScenario,
  previousLedger?: SandboxEvidenceLedgerRecord
): ControlledReplayScenarioResult {
  const prevHash = previousLedger?.hash ?? "GENESIS";
  const trustSpineResult = runSandboxTrustSpineConsolidation(scenario.payload, prevHash);
  const refusalCodes: ReplaySuiteRefusalCode[] = [];

  if (hasLiveLeak(trustSpineResult)) {
    refusalCodes.push("LIVE_CAPABILITY_LEAK_REFUSED");
  }

  let ledgerRecord = trustSpineResult.ledgerRecord;
  let observedOutcome: ReplayObservedOutcome =
    trustSpineResult.status === "SANDBOX_TRUST_SPINE_CONSOLIDATION_READY" ? "READY" : "REFUSED";

  if (scenario.tampersLedgerAfterRun && ledgerRecord) {
    ledgerRecord = {
      ...ledgerRecord,
      proofChain: {
        ...ledgerRecord.proofChain,
        paiSafeDisplayId: `${ledgerRecord.proofChain.paiSafeDisplayId}_tampered`
      }
    };
  }

  const chainRecords = previousLedger && ledgerRecord ? [previousLedger, ledgerRecord] : ledgerRecord ? [ledgerRecord] : [];
  const chainCheck = verifySandboxEvidenceLedgerChain(chainRecords);

  if (!chainCheck.valid && scenario.expectedOutcome === "REFUSED_BY_LEDGER_CHAIN") {
    observedOutcome = "CHAIN_REFUSED";
  }

  refusalCodes.push(
    ...scenarioFailureCodes(
      scenario,
      observedOutcome,
      chainCheck.valid,
      trustSpineResult.status
    )
  );

  const expectationMatched = expectedMatchesObserved(scenario.expectedOutcome, observedOutcome);
  const passed = refusalCodes.length === 0 && expectationMatched;

  return {
    __brand: "CONTROLLED_REPLAY_SCENARIO_RESULT",
    scenarioId: scenario.scenarioId,
    kind: scenario.kind,
    expectedOutcome: scenario.expectedOutcome,
    observedOutcome,
    passed,
    trustSpineResult,
    ...(ledgerRecord ? { ledgerRecord } : {}),
    ledgerChainValid: chainCheck.valid,
    refusalCodes: unique(refusalCodes),
    diagnostic: passed
      ? `Scenario ${scenario.scenarioId} passed with observed outcome ${observedOutcome}.`
      : `Scenario ${scenario.scenarioId} failed with observed outcome ${observedOutcome}.`,
    boundary: boundary()
  };
}

export function summarizeControlledReplayResults(
  results: ControlledReplayScenarioResult[]
): ControlledReplaySummary {
  const total = results.length;
  const passed = results.filter((result) => result.passed).length;
  const failed = total - passed;
  const validReadyCount = results.filter((result) => result.expectedOutcome === "READY" && result.observedOutcome === "READY").length;
  const refusedCount = results.filter((result) => result.observedOutcome === "REFUSED").length;
  const chainRefusedCount = results.filter((result) => result.observedOutcome === "CHAIN_REFUSED").length;
  const liveAttemptsRefused = results.filter((result) => result.kind === "LIVE_RAIL_ATTEMPT" && result.observedOutcome === "REFUSED").length;
  const mutationAttemptsRefused = results.filter((result) => result.kind === "MUTATION_ATTEMPT" && result.observedOutcome === "REFUSED").length;
  const missingRefAttemptsRefused = results.filter(
    (result) =>
      (result.kind === "MISSING_TRANSACTION_REF" ||
        result.kind === "MISSING_EVENT_REF" ||
        result.kind === "MISSING_REPLAY_NONCE") &&
      result.observedOutcome === "REFUSED"
  ).length;

  const score = total === 0 ? 0 : Math.round((passed / total) * 100);

  const refusalCodes: ReplaySuiteRefusalCode[] = [];

  if (total === 0) refusalCodes.push("REPLAY_BATCH_EMPTY");
  if (score < 100) refusalCodes.push("SUMMARY_SCORE_BELOW_THRESHOLD");

  for (const result of results) {
    refusalCodes.push(...result.refusalCodes);
  }

  return {
    __brand: "CONTROLLED_REPLAY_SUMMARY",
    total,
    passed,
    failed,
    validReadyCount,
    refusedCount,
    chainRefusedCount,
    liveAttemptsRefused,
    mutationAttemptsRefused,
    missingRefAttemptsRefused,
    score,
    refusalCodes: unique(refusalCodes),
    boundary: {
      summaryIsEvidenceOnly: true,
      summaryCreatesNoAuthority: true,
      summaryDoesNotAuthorizeLaunch: true,
      summaryDoesNotAuthorizeLiveRails: true
    }
  };
}

export function runControlledSandboxTransactionReplaySuite(
  scenarios = buildControlledReplayScenarios()
): ControlledSandboxTransactionReplaySuiteResult {
  const scenarioResults: ControlledReplayScenarioResult[] = [];
  const ledgerRecords: SandboxEvidenceLedgerRecord[] = [];

  let previousReadyLedger: SandboxEvidenceLedgerRecord | undefined;

  for (const scenario of scenarios) {
    const result = runControlledReplayScenario(scenario, previousReadyLedger);
    scenarioResults.push(result);

    if (
      result.passed &&
      result.ledgerRecord &&
      result.ledgerRecord.status === "SANDBOX_EVIDENCE_LEDGER_READY" &&
      result.observedOutcome === "READY"
    ) {
      ledgerRecords.push(result.ledgerRecord);
      previousReadyLedger = result.ledgerRecord;
    }
  }

  const summary = summarizeControlledReplayResults(scenarioResults);
  const refusalCodes: ReplaySuiteRefusalCode[] = [...summary.refusalCodes];

  const status: ControlledReplaySuiteStatus =
    refusalCodes.length === 0 && summary.score === 100
      ? "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_READY"
      : "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_REFUSED";

  return {
    __brand: "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_RESULT",
    suiteId: "controlled_sandbox_replay_suite_001",
    status,
    scenarioResults,
    summary,
    ledgerRecords,
    refusalCodes: unique(refusalCodes),
    boundary: {
      suiteIsSandboxOnly: true,
      noLiveRailsCreated: true,
      noLivePaymentProcessingCreated: true,
      noLiveTransactionTruthCreated: true,
      noLiveATSCreated: true,
      noCustodyTransferCreated: true,
      noRuntimeActivationCreated: true,
      replaySuiteIsNotLaunchApproval: true
    }
  };
}

export const CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_DOCTRINE = {
  name: "Controlled Sandbox Transaction Replay Suite",
  class: "SANDBOX_REPLAY_PRESSURE_AND_REFUSAL_VALIDATION_LAYER",
  purpose:
    "Pressure-test the sandbox transaction path with valid, duplicate, replay, stale, live, mutation, missing-reference, partial, failed, and tampered-chain scenarios while proving no live capability or launch authority is created.",
  boundary: {
    sandboxOnly: true,
    replayIsTestOnly: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noLiveTransactionTruthCreated: true,
    noLiveATSCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true,
    notLaunchApproval: true
  }
} as const;


