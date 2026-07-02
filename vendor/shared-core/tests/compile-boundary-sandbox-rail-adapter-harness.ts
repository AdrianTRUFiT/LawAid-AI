import type {
  ActivatedTransactionStateEmissionAuthority,
  FundTrackerMutationAuthority,
  LivePaymentProcessingAuthority,
  LiveRailConnectionAuthority,
  SandboxRailAdapterAcceptedEvent,
  SandboxRailAdapterResult
} from "../sandbox-rail-adapter-harness";

const acceptedEvent: SandboxRailAdapterAcceptedEvent = {
  __brand: "SANDBOX_RAIL_ADAPTER_ACCEPTED_EVENT",
  adapterEventRef: "sandbox_adapter_compile_evt",
  provider: "STRIPE_SANDBOX",
  normalizedEvent: {
    __brand: "SANDBOX_PROCESSOR_EVENT",
    eventRef: "compile_evt",
    transactionRef: "compile_txn",
    eventKind: "SANDBOX_PROCESSOR_EVENT_SUCCESS",
    amountCents: 100,
    currency: "USD",
    sandboxOnly: true,
    liveRail: false,
    livePayment: false,
    createdAt: "2026-04-28T00:00:00.000Z",
    expiresAt: "2026-04-28T01:00:00.000Z",
    replayNonce: "compile_nonce"
  },
  verifiedOpportunity: {
    __brand: "SANDBOX_VERIFIED_OPPORTUNITY",
    verifiedOpportunityRef: "sandbox_verified_opportunity_compile_txn",
    transactionRef: "compile_txn",
    sandboxOnly: true,
    createdAt: "2026-04-28T00:00:00.000Z"
  },
  boundary: {
    acceptedEventIsSandboxOnly: true,
    processorEventIsNotAuthority: true,
    adapterDoesNotMutateFundTrackerState: true,
    adapterDoesNotEmitATS: true,
    adapterDoesNotProcessPayment: true,
    adapterCreatesNoLiveRails: true,
    adapterCreatesNoLiveTransactionTruth: true
  }
};

void acceptedEvent;

// @ts-expect-error Accepted adapter event cannot become live rail authority.
const asLiveRailAuthority: LiveRailConnectionAuthority = acceptedEvent;

void asLiveRailAuthority;

// @ts-expect-error Accepted adapter event cannot become live payment processing authority.
const asLivePaymentAuthority: LivePaymentProcessingAuthority = acceptedEvent;

void asLivePaymentAuthority;

// @ts-expect-error Accepted adapter event cannot become FundTracker mutation authority.
const asMutationAuthority: FundTrackerMutationAuthority = acceptedEvent;

void asMutationAuthority;

// @ts-expect-error Accepted adapter event cannot become ATS emission authority.
const asATSAuthority: ActivatedTransactionStateEmissionAuthority = acceptedEvent;

void asATSAuthority;

// @ts-expect-error Accepted event cannot create live rails.
acceptedEvent.boundary.adapterCreatesNoLiveRails = false;

// @ts-expect-error Adapter cannot mutate FundTracker state.
acceptedEvent.boundary.adapterDoesNotMutateFundTrackerState = false;

// @ts-expect-error Adapter cannot emit ATS.
acceptedEvent.boundary.adapterDoesNotEmitATS = false;

// @ts-expect-error Adapter cannot process payment.
acceptedEvent.boundary.adapterDoesNotProcessPayment = false;

// @ts-expect-error Normalized sandbox event cannot become live rail.
acceptedEvent.normalizedEvent.liveRail = true;

// @ts-expect-error Normalized sandbox event cannot become live payment.
acceptedEvent.normalizedEvent.livePayment = true;

const result: SandboxRailAdapterResult = {
  __brand: "SANDBOX_RAIL_ADAPTER_RESULT",
  status: "SANDBOX_RAIL_ADAPTER_ACCEPTED",
  acceptedEvent,
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

void result;

// @ts-expect-error Adapter result cannot create transaction mutation.
result.boundary.adapterCreatesNoTransactionMutation = false;

// @ts-expect-error Adapter result cannot create ATS.
result.boundary.adapterCreatesNoATS = false;
