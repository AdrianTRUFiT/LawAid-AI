import type {
  PaiSafeConsumerDisplayState,
  PaiSafeUiAuthorityState,
  PaiSafeUiWalletBehavior
} from "../pai-safe-ui-state-mapping";

const displayState: PaiSafeConsumerDisplayState = {
  __brand: "PAI_SAFE_CONSUMER_DISPLAY_STATE",
  displayId: "display_compile_001",
  transactionRef: "txn_compile_001",
  headline: "Payment event received",
  subheadline: "Processor success is visible, but it is not final transaction truth.",
  consumerExplanation: "Display only.",
  tone: "warning",
  severity: "MEDIUM",
  primaryAction: "wait",
  safeToShowConsumer: true,
  showProceedAffordance: false,
  showDownstreamUnlock: false,
  lanes: {
    processor: {
      visible: true,
      label: "Processor event received",
      authority: false
    },
    fundTracker: {
      visible: false,
      label: "FundTrackerAI verification pending",
      authority: true
    },
    activatedTransactionState: {
      visible: false,
      label: "Activated Transaction State not present",
      authority: false,
      unlockArtifact: false
    }
  },
  sourceRefs: {
    processorEventRef: "processor_evt_compile"
  },
  boundary: {
    uiIsDisplayOnly: true,
    uiDoesNotCreatePaymentAuthority: true,
    uiDoesNotCreateTransactionTruth: true,
    uiDoesNotMutateTransactionState: true,
    uiDoesNotCreateATS: true,
    uiDoesNotCreateWalletBehavior: true,
    uiDoesNotOverrideFundTrackerAI: true,
    displayIsNotAuthority: true
  }
};

void displayState;

// @ts-expect-error UI display state cannot become UI authority state.
const displayAsAuthority: PaiSafeUiAuthorityState = displayState;

void displayAsAuthority;

// @ts-expect-error UI display state cannot become wallet behavior.
const displayAsWalletBehavior: PaiSafeUiWalletBehavior = displayState;

void displayAsWalletBehavior;

// @ts-expect-error Processor lane cannot be authority.
displayState.lanes.processor.authority = true;

// @ts-expect-error Display boundary cannot create payment authority.
displayState.boundary.uiDoesNotCreatePaymentAuthority = false;

// @ts-expect-error Display boundary cannot create transaction truth.
displayState.boundary.uiDoesNotCreateTransactionTruth = false;

// @ts-expect-error Display boundary cannot create ATS.
displayState.boundary.uiDoesNotCreateATS = false;

// @ts-expect-error Display boundary cannot create wallet behavior.
displayState.boundary.uiDoesNotCreateWalletBehavior = false;
