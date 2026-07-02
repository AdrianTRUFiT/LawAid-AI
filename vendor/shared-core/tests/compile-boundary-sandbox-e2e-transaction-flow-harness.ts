import type {
  LiveActivatedTransactionStateAuthority,
  LivePaymentProcessingAuthority,
  LiveRailAuthority,
  LiveTransactionTruthAuthority,
  RuntimeActivationAuthority,
  SandboxEndToEndTransactionFlowResult
} from "../sandbox-e2e-transaction-flow-harness";

const result: SandboxEndToEndTransactionFlowResult = {
  __brand: "SANDBOX_E2E_TRANSACTION_FLOW_RESULT",
  flowId: "sandbox_e2e_compile",
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
};

void result;

// @ts-expect-error E2E harness cannot become live rail authority.
const asLiveRailAuthority: LiveRailAuthority = result;

void asLiveRailAuthority;

// @ts-expect-error E2E harness cannot become live payment processing authority.
const asLivePaymentAuthority: LivePaymentProcessingAuthority = result;

void asLivePaymentAuthority;

// @ts-expect-error E2E harness cannot become live transaction truth authority.
const asLiveTruthAuthority: LiveTransactionTruthAuthority = result;

void asLiveTruthAuthority;

// @ts-expect-error E2E harness cannot become live ATS authority.
const asLiveATSAuthority: LiveActivatedTransactionStateAuthority = result;

void asLiveATSAuthority;

// @ts-expect-error E2E harness cannot become runtime activation authority.
const asRuntimeActivationAuthority: RuntimeActivationAuthority = result;

void asRuntimeActivationAuthority;

// @ts-expect-error E2E harness cannot create live rails.
result.boundary.e2eCreatesNoLiveRails = false;

// @ts-expect-error E2E harness cannot create live payment processing.
result.boundary.e2eCreatesNoLivePaymentProcessing = false;

// @ts-expect-error E2E harness cannot create live transaction truth.
result.boundary.e2eCreatesNoLiveTransactionTruth = false;

// @ts-expect-error E2E harness cannot create live ATS.
result.boundary.e2eCreatesNoLiveATS = false;

// @ts-expect-error E2E harness cannot create runtime activation.
result.boundary.e2eCreatesNoRuntimeActivation = false;

// @ts-expect-error PAI-SAFE must remain display only.
result.boundary.paiSafeIsDisplayOnly = false;

// @ts-expect-error UI must remain display only.
result.boundary.uiIsDisplayOnly = false;
