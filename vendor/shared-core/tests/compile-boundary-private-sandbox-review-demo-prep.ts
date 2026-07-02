import type {
  LivePaymentProcessingAuthority,
  LiveRailAuthority,
  PublicLaunchAuthority,
  RuntimeActivationAuthority,
  PrivateSandboxReviewDemoPrepPacket,
  SandboxDemoPrepContract,
  OperatorReviewChecklist
} from "../private-sandbox-review-demo-prep";

const checklist: OperatorReviewChecklist = {
  __brand: "OPERATOR_REVIEW_CHECKLIST",
  checklistId: "compile_checklist",
  requiredChecks: [],
  prohibitedClaims: [],
  requiredBoundaryLanguage: [],
  boundary: {
    checklistIsReviewOnly: true,
    checklistCreatesNoLaunchAuthority: true,
    checklistCreatesNoPaymentAuthority: true,
    checklistCreatesNoRuntimeActivation: true
  }
};

void checklist;

// @ts-expect-error Checklist cannot become launch authority.
const checklistAsLaunch: PublicLaunchAuthority = checklist;

void checklistAsLaunch;

// @ts-expect-error Checklist cannot create runtime activation.
checklist.boundary.checklistCreatesNoRuntimeActivation = false;

const contract: SandboxDemoPrepContract = {
  __brand: "SANDBOX_DEMO_PREP_CONTRACT",
  contractId: "compile_contract",
  demoName: "Compile Demo",
  reviewMode: "PRIVATE_OPERATOR_REVIEW_ONLY",
  allowedAudience: "OPERATOR_ONLY",
  allowedDemoClaims: [],
  blockedCapabilities: [],
  operatorReviewChecklist: checklist,
  boundary: {
    demoIsSandboxOnly: true,
    demoIsNotPublicLaunch: true,
    demoCreatesNoLiveRails: true,
    demoCreatesNoPaymentProcessing: true,
    demoCreatesNoLiveTransactionTruth: true,
    demoCreatesNoLiveATS: true,
    demoCreatesNoCustodyTransfer: true,
    demoCreatesNoRuntimeActivation: true,
    demoCreatesNoLegalFinancialAuthorityClaims: true
  }
};

void contract;

// @ts-expect-error Demo contract cannot become live rail authority.
const contractAsLiveRail: LiveRailAuthority = contract;

void contractAsLiveRail;

// @ts-expect-error Demo contract cannot become payment authority.
const contractAsPayment: LivePaymentProcessingAuthority = contract;

void contractAsPayment;

// @ts-expect-error Demo contract cannot create live rails.
contract.boundary.demoCreatesNoLiveRails = false;

// @ts-expect-error Demo contract cannot create payment processing.
contract.boundary.demoCreatesNoPaymentProcessing = false;

// @ts-expect-error Demo contract cannot become public launch.
contract.boundary.demoIsNotPublicLaunch = false;

const packet: PrivateSandboxReviewDemoPrepPacket = {
  __brand: "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_PACKET",
  packetId: "compile_packet",
  status: "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_READY",
  decision: "ALLOW_PRIVATE_OPERATOR_REVIEW",
  allowedNextLane: "PRIVATE_OPERATOR_REVIEW",
  demoContract: contract,
  operatorReviewOutcome: "READY_FOR_PRIVATE_REVIEW",
  refusalReasons: [],
  humanApprovalRequired: true,
  boundary: {
    packetIsPrivateReviewOnly: true,
    packetIsNotLaunchApproval: true,
    packetCreatesNoLiveRails: true,
    packetCreatesNoPaymentProcessing: true,
    packetCreatesNoLiveTransactionTruth: true,
    packetCreatesNoLiveATS: true,
    packetCreatesNoCustodyTransfer: true,
    packetCreatesNoRuntimeActivation: true,
    packetCreatesNoLegalFinancialAuthorityClaims: true
  }
};

void packet;

// @ts-expect-error Review packet cannot become public launch authority.
const packetAsLaunch: PublicLaunchAuthority = packet;

void packetAsLaunch;

// @ts-expect-error Review packet cannot become runtime authority.
const packetAsRuntime: RuntimeActivationAuthority = packet;

void packetAsRuntime;

// @ts-expect-error Review packet cannot create runtime activation.
packet.boundary.packetCreatesNoRuntimeActivation = false;

// @ts-expect-error Review packet cannot create live rails.
packet.boundary.packetCreatesNoLiveRails = false;

// @ts-expect-error Review packet cannot remove human approval.
packet.humanApprovalRequired = false;
