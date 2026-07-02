import type {
  LivePaymentProcessingAuthority,
  LiveRailAuthority,
  PublicLaunchAuthority,
  RuntimeActivationAuthority,
  SandboxLaunchReadinessEvidencePacket
} from "../sandbox-launch-readiness-evidence-packet";

const packet: SandboxLaunchReadinessEvidencePacket = {
  __brand: "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET",
  packetId: "phase3_compile_packet",
  status: "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_READY",
  decision: "ALLOW_PRIVATE_SANDBOX_REVIEW_ONLY",
  dependency: {
    artifactName: "Controlled Sandbox Transaction Replay Suite",
    artifactPath: "D:\\DEV\\AIVA\\shared-data\\controlled-sandbox-transaction-replay-suite\\controlled-sandbox-transaction-replay-suite.json",
    expectedStatus: "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_READY",
    actualStatus: "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_READY",
    scopedCompile: "PASS",
    smoke: "PASS"
  },
  claimToArtifactMap: [],
  blockedCapabilities: [
    "LIVE_RAIL_CONNECTION",
    "LIVE_PAYMENT_PROCESSING",
    "LIVE_TRANSACTION_TRUTH",
    "LIVE_ATS",
    "CUSTODY_TRANSFER",
    "RUNTIME_ACTIVATION",
    "PUBLIC_LAUNCH",
    "LEGAL_FINANCIAL_AUTHORITY_CLAIMS"
  ],
  allowedNextLane: "PRIVATE_SANDBOX_REVIEW_ONLY",
  humanApprovalRequired: true,
  refusalReasons: [],
  boundary: {
    packetIsEvidenceOnly: true,
    packetIsNotLaunchApproval: true,
    packetCreatesNoLiveRails: true,
    packetCreatesNoLivePaymentProcessing: true,
    packetCreatesNoLiveTransactionTruth: true,
    packetCreatesNoLiveATS: true,
    packetCreatesNoCustodyTransfer: true,
    packetCreatesNoRuntimeActivation: true,
    packetCreatesNoLegalFinancialAuthorityClaims: true
  }
};

void packet;

// @ts-expect-error Phase 3 evidence packet cannot become live rail authority.
const asLiveRail: LiveRailAuthority = packet;

void asLiveRail;

// @ts-expect-error Phase 3 evidence packet cannot become payment authority.
const asPayment: LivePaymentProcessingAuthority = packet;

void asPayment;

// @ts-expect-error Phase 3 evidence packet cannot become public launch authority.
const asLaunch: PublicLaunchAuthority = packet;

void asLaunch;

// @ts-expect-error Phase 3 evidence packet cannot become runtime activation authority.
const asRuntime: RuntimeActivationAuthority = packet;

void asRuntime;

// @ts-expect-error Phase 3 packet cannot create live rails.
packet.boundary.packetCreatesNoLiveRails = false;

// @ts-expect-error Phase 3 packet cannot create payment processing.
packet.boundary.packetCreatesNoLivePaymentProcessing = false;

// @ts-expect-error Phase 3 packet cannot create runtime activation.
packet.boundary.packetCreatesNoRuntimeActivation = false;

// @ts-expect-error Phase 3 packet cannot become launch approval.
packet.boundary.packetIsNotLaunchApproval = false;

// @ts-expect-error Phase 3 packet cannot remove human approval requirement.
packet.humanApprovalRequired = false;
