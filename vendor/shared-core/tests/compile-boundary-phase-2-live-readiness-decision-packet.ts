import type {
  ActivatedTransactionStateAuthority,
  LiveRailAuthority,
  PaymentProcessingAuthority,
  Phase2ReadinessDecisionPacket,
  TransactionMutationAuthority
} from "../phase-2-live-readiness-decision-packet";

const packet: Phase2ReadinessDecisionPacket = {
  __brand: "PHASE_2_LIVE_READINESS_DECISION_PACKET",
  packetId: "phase2_compile_packet",
  status: "PHASE_2_LIVE_READINESS_DECISION_PACKET_READY",
  gateDecision: "ALLOW_SANDBOX_PREP",
  input: {
    processorRailTarget: "STRIPE_SANDBOX",
    merchantEntityPosture: "ENTITY_READY_FOR_SANDBOX_ONLY",
    pciScopePosture: "HOSTED_CHECKOUT_ONLY",
    firstTransactionType: "SANDBOX_TEST_PAYMENT",
    firstActivationEnvironment: "SANDBOX_ONLY",
    fundTrackerMutationScope: "SANDBOX_STATE_ONLY",
    activatedTransactionStateReality: "SANDBOX_ATS_ONLY",
    mainHumanApprovalRecorded: true,
    liveRailRequested: false,
    processorWorkRequested: false,
    paymentProcessingRequested: false,
    publicLaunchRequested: false
  },
  allowedNextBuildLane: "FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY",
  blockedReasons: [],
  requiredMainRulings: [],
  phase2Scope: {
    processorRailSelected: true,
    merchantEntityPostureSelected: true,
    pciScopeSelected: true,
    firstTransactionTypeSelected: true,
    firstActivationEnvironmentSelected: true,
    fundTrackerMutationScopeSelected: true,
    atsRealitySelected: true
  },
  boundary: {
    packetCreatesNoLiveRails: true,
    packetCreatesNoPaymentAuthority: true,
    packetCreatesNoTransactionTruth: true,
    packetCreatesNoTransactionMutation: true,
    packetCreatesNoActivatedTransactionState: true,
    packetCreatesNoCustodyTransfer: true,
    packetCreatesNoRuntimeActivation: true,
    packetDoesNotAuthorizePublicLaunch: true,
    packetIsDecisionGateOnly: true
  }
};

void packet;

// @ts-expect-error Decision packet cannot become live rail authority.
const asLiveRailAuthority: LiveRailAuthority = packet;

void asLiveRailAuthority;

// @ts-expect-error Decision packet cannot become payment processing authority.
const asPaymentAuthority: PaymentProcessingAuthority = packet;

void asPaymentAuthority;

// @ts-expect-error Decision packet cannot become transaction mutation authority.
const asMutationAuthority: TransactionMutationAuthority = packet;

void asMutationAuthority;

// @ts-expect-error Decision packet cannot become ATS authority.
const asATSAuthority: ActivatedTransactionStateAuthority = packet;

void asATSAuthority;

// @ts-expect-error Decision packet cannot create live rails.
packet.boundary.packetCreatesNoLiveRails = false;

// @ts-expect-error Decision packet cannot create payment authority.
packet.boundary.packetCreatesNoPaymentAuthority = false;

// @ts-expect-error Decision packet cannot create transaction truth.
packet.boundary.packetCreatesNoTransactionTruth = false;

// @ts-expect-error Decision packet cannot create state mutation.
packet.boundary.packetCreatesNoTransactionMutation = false;

// @ts-expect-error Decision packet cannot create ATS.
packet.boundary.packetCreatesNoActivatedTransactionState = false;
