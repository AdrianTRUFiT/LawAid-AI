import type {
  ControlledSandboxTransactionReplaySuiteResult,
  ControlledReplayScenarioResult,
  LivePaymentProcessingAuthority,
  LiveRailAuthority,
  LiveTransactionTruthAuthority,
  RuntimeActivationAuthority
} from "../controlled-sandbox-transaction-replay-suite";

const scenarioResult: ControlledReplayScenarioResult = {
  __brand: "CONTROLLED_REPLAY_SCENARIO_RESULT",
  scenarioId: "compile_scenario",
  kind: "VALID_SANDBOX",
  expectedOutcome: "READY",
  observedOutcome: "READY",
  passed: true,
  trustSpineResult: {
    __brand: "SANDBOX_TRUST_SPINE_CONSOLIDATION_RESULT",
    consolidationId: "compile_consolidation",
    status: "SANDBOX_TRUST_SPINE_CONSOLIDATION_READY",
    transactionRef: "compile_txn",
    e2eFlow: {
      __brand: "SANDBOX_E2E_TRANSACTION_FLOW_RESULT",
      flowId: "compile_flow",
      transactionRef: "compile_txn",
      status: "SANDBOX_E2E_TRANSACTION_FLOW_READY",
      refusalCodes: [],
      intake: {
        __brand: "SANDBOX_RAIL_ADAPTER_RESULT",
        status: "SANDBOX_RAIL_ADAPTER_REFUSED",
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
      },
      proofChain: {},
      boundary: {
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
      }
    },
    refusalCodes: [],
    boundary: {
      consolidationIsSandboxOnly: true,
      noLiveRailsCreated: true,
      noLivePaymentProcessingCreated: true,
      noLiveTransactionTruthCreated: true,
      noLiveATSCreated: true,
      noCustodyTransferCreated: true,
      noRuntimeActivationCreated: true,
      evidenceLedgerIsNotAuthority: true,
      auditSpineIsReadOnly: true,
      reviewPacketIsNotLaunchApproval: true
    }
  },
  ledgerChainValid: true,
  refusalCodes: [],
  diagnostic: "compile",
  boundary: {
    replayCreatesNoLiveRails: true,
    replayCreatesNoLivePaymentProcessing: true,
    replayCreatesNoLiveTransactionTruth: true,
    replayCreatesNoLiveATS: true,
    replayCreatesNoCustodyTransfer: true,
    replayCreatesNoRuntimeActivation: true,
    replayIsTestOnly: true
  }
};

void scenarioResult;

// @ts-expect-error Replay scenario result cannot become live rail authority.
const scenarioAsLiveRail: LiveRailAuthority = scenarioResult;

void scenarioAsLiveRail;

// @ts-expect-error Replay scenario result cannot become payment authority.
const scenarioAsPayment: LivePaymentProcessingAuthority = scenarioResult;

void scenarioAsPayment;

// @ts-expect-error Replay scenario result cannot create live transaction truth.
const scenarioAsTruth: LiveTransactionTruthAuthority = scenarioResult;

void scenarioAsTruth;

// @ts-expect-error Replay scenario result cannot create runtime activation.
const scenarioAsRuntime: RuntimeActivationAuthority = scenarioResult;

void scenarioAsRuntime;

// @ts-expect-error Replay scenario cannot create live rails.
scenarioResult.boundary.replayCreatesNoLiveRails = false;

// @ts-expect-error Replay scenario cannot create live payment processing.
scenarioResult.boundary.replayCreatesNoLivePaymentProcessing = false;

// @ts-expect-error Replay scenario cannot create runtime activation.
scenarioResult.boundary.replayCreatesNoRuntimeActivation = false;

const suite: ControlledSandboxTransactionReplaySuiteResult = {
  __brand: "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_RESULT",
  suiteId: "compile_suite",
  status: "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_READY",
  scenarioResults: [scenarioResult],
  summary: {
    __brand: "CONTROLLED_REPLAY_SUMMARY",
    total: 1,
    passed: 1,
    failed: 0,
    validReadyCount: 1,
    refusedCount: 0,
    chainRefusedCount: 0,
    liveAttemptsRefused: 0,
    mutationAttemptsRefused: 0,
    missingRefAttemptsRefused: 0,
    score: 100,
    refusalCodes: [],
    boundary: {
      summaryIsEvidenceOnly: true,
      summaryCreatesNoAuthority: true,
      summaryDoesNotAuthorizeLaunch: true,
      summaryDoesNotAuthorizeLiveRails: true
    }
  },
  ledgerRecords: [],
  refusalCodes: [],
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

void suite;

// @ts-expect-error Replay suite cannot become live rail authority.
const suiteAsLiveRail: LiveRailAuthority = suite;

void suiteAsLiveRail;

// @ts-expect-error Replay suite cannot authorize launch/runtime activation.
const suiteAsRuntime: RuntimeActivationAuthority = suite;

void suiteAsRuntime;

// @ts-expect-error Replay suite cannot create live rails.
suite.boundary.noLiveRailsCreated = false;

// @ts-expect-error Replay suite cannot become launch approval.
suite.boundary.replaySuiteIsNotLaunchApproval = false;
