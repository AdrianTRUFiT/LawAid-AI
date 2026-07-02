import type {
  PaiSafeSurfaceContractState,
  PaymentAuthorityState,
  FundTrackerSurfaceOutput
} from "../pai-safe-surface-contract";

import type {
  TransactionTruthState
} from "../pai-safe-surface-failure-taxonomy";

const surfaceState: PaiSafeSurfaceContractState = {
  __brand: "PAI_SAFE_SURFACE_CONTRACT_STATE",
  paiSafeContractId: "pai_safe_contract_compile_001",
  transactionRef: "txn_compile_001",
  status: "processor_success_not_authority",
  failureClass: "PROCESSOR_ONLY_SUCCESS",
  consumerMessage: "Display only.",
  safeToDisplay: true,
  safeToProceed: false,
  downstreamActivationEligible: false,
  sourceRefs: {
    processorEventRef: "processor_evt_compile"
  },
  visualDistinctions: {
    processorTransportVisible: true,
    fundTrackerVerificationVisible: false,
    activatedTransactionStateVisible: false,
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

void surfaceState;

// @ts-expect-error PAI-SAFE surface contract state cannot be transaction truth.
const surfaceAsTruth: TransactionTruthState = surfaceState;

void surfaceAsTruth;

// @ts-expect-error PAI-SAFE surface contract state cannot be payment authority.
const surfaceAsPaymentAuthority: PaymentAuthorityState = surfaceState;

void surfaceAsPaymentAuthority;

// @ts-expect-error PAI-SAFE contract cannot have write path.
surfaceState.readOnlyContract.paiSafeHasWritePath = true;

// @ts-expect-error PAI-SAFE contract cannot process payment.
surfaceState.readOnlyContract.paiSafeProcessesPayment = true;

// @ts-expect-error Processor success cannot be authority.
surfaceState.visualDistinctions.processorSuccessIsAuthority = true;

// @ts-expect-error Display cannot be authority.
surfaceState.visualDistinctions.displayIsAuthority = true;

const invalidEmitter: FundTrackerSurfaceOutput = {
  __brand: "FUNDTRACKER_SURFACE_OUTPUT",
  transactionRef: "txn_bad_emitter",
  processorEventKind: "success",
  fundTrackerDecisionKind: "verified",
  activatedTransactionStateKind: "absent",
  // @ts-expect-error FundTracker output must be emitted by FundTrackerAI.
  emittedBy: "PAI_SAFE",
  createdAt: "2026-04-28T00:00:00.000Z"
};

void invalidEmitter;
