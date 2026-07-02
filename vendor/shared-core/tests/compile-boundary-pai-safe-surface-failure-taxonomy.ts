import type {
  PaiSafeSurfaceProjection,
  TransactionTruthState
} from "../pai-safe-surface-failure-taxonomy";

const projection: PaiSafeSurfaceProjection = {
  __brand: "PAI_SAFE_SURFACE_PROJECTION",
  paiSafeId: "pai_safe_compile_001",
  transactionRef: "txn_compile_001",
  status: "processor_success_not_authority",
  failureClass: "PROCESSOR_ONLY_SUCCESS",
  consumerMessage: "Display only.",
  safeToDisplay: true,
  safeToProceed: false,
  downstreamActivationEligible: false,
  references: {
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
  boundary: {
    paiSafeIsProjectionOnly: true,
    paiSafeDoesNotProcessPayment: true,
    paiSafeDoesNotVerifyTruth: true,
    paiSafeDoesNotMutateTransactionState: true,
    paiSafeDoesNotCreateActivatedTransactionState: true,
    paiSafeDoesNotOverrideFundTrackerAI: true,
    paiSafeDoesNotCreateWalletBehavior: true,
    paiSafeDoesNotCreateAuthority: true
  }
};

void projection;

// @ts-expect-error PAI-SAFE projection cannot be assigned to transaction truth state.
const projectionAsTruth: TransactionTruthState = projection;

void projectionAsTruth;

// @ts-expect-error Processor success cannot be marked as authority in PAI-SAFE visual distinctions.
projection.visualDistinctions.processorSuccessIsAuthority = true;

// @ts-expect-error PAI-SAFE display cannot be marked as authority.
projection.visualDistinctions.displayIsAuthority = true;

// @ts-expect-error PAI-SAFE cannot create wallet behavior.
projection.boundary.paiSafeDoesNotCreateWalletBehavior = false;

// @ts-expect-error PAI-SAFE cannot create Activated Transaction State.
projection.boundary.paiSafeDoesNotCreateActivatedTransactionState = false;
