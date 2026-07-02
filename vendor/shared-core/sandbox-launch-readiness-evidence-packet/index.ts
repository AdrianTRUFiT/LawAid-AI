export type Phase3GateStatus =
  | "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_READY"
  | "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_BLOCKED"
  | "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_REFUSED";

export type Phase3Decision =
  | "ALLOW_PHASE_3_SANDBOX_DEMO_PREP"
  | "ALLOW_PRIVATE_SANDBOX_REVIEW_ONLY"
  | "BLOCK_LIVE_RAILS"
  | "REQUIRE_MAIN_APPROVAL";

export type ReadinessClaimStatus =
  | "VERIFIED"
  | "BLOCKED"
  | "NOT_AUTHORIZED";

export type Phase3BlockedCapability =
  | "LIVE_RAIL_CONNECTION"
  | "LIVE_PAYMENT_PROCESSING"
  | "LIVE_TRANSACTION_TRUTH"
  | "LIVE_ATS"
  | "CUSTODY_TRANSFER"
  | "RUNTIME_ACTIVATION"
  | "PUBLIC_LAUNCH"
  | "LEGAL_FINANCIAL_AUTHORITY_CLAIMS";

export interface LiveRailAuthority {
  readonly __brand: "LIVE_RAIL_AUTHORITY";
  mayConnectLiveRails: true;
}

export interface LivePaymentProcessingAuthority {
  readonly __brand: "LIVE_PAYMENT_PROCESSING_AUTHORITY";
  mayProcessLivePayment: true;
}

export interface PublicLaunchAuthority {
  readonly __brand: "PUBLIC_LAUNCH_AUTHORITY";
  mayLaunchPublicly: true;
}

export interface RuntimeActivationAuthority {
  readonly __brand: "RUNTIME_ACTIVATION_AUTHORITY";
  mayActivateRuntime: true;
}

export interface Phase3EvidenceDependency {
  artifactName: string;
  artifactPath: string;
  expectedStatus: string;
  actualStatus: string;
  scopedCompile: "PASS" | "FAIL";
  smoke: "PASS" | "FAIL";
}

export interface Phase3ClaimToArtifact {
  claim: string;
  status: ReadinessClaimStatus;
  artifactPath: string;
  proof: string;
}

export interface Phase3DecisionInput {
  mainApprovalRecorded: boolean;
  requestLiveRails: boolean;
  requestPaymentProcessing: boolean;
  requestPublicLaunch: boolean;
  requestRuntimeActivation: boolean;
  replaySuiteStatus: string;
  replaySuiteScopedCompile: "PASS" | "FAIL";
  replaySuiteSmoke: "PASS" | "FAIL";
}

export interface SandboxLaunchReadinessEvidencePacket {
  readonly __brand: "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET";
  packetId: string;
  status: Phase3GateStatus;
  decision: Phase3Decision;
  dependency: Phase3EvidenceDependency;
  claimToArtifactMap: Phase3ClaimToArtifact[];
  blockedCapabilities: Phase3BlockedCapability[];
  allowedNextLane:
    | "SANDBOX_DEMO_PREP_AND_OPERATOR_REVIEW"
    | "PRIVATE_SANDBOX_REVIEW_ONLY"
    | "NONE";
  readonly humanApprovalRequired: true;
  refusalReasons: string[];
  boundary: {
    packetIsEvidenceOnly: true;
    packetIsNotLaunchApproval: true;
    packetCreatesNoLiveRails: true;
    packetCreatesNoLivePaymentProcessing: true;
    packetCreatesNoLiveTransactionTruth: true;
    packetCreatesNoLiveATS: true;
    packetCreatesNoCustodyTransfer: true;
    packetCreatesNoRuntimeActivation: true;
    packetCreatesNoLegalFinancialAuthorityClaims: true;
  };
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function evaluatePhase3Gate(input: Phase3DecisionInput): SandboxLaunchReadinessEvidencePacket {
  const refusalReasons: string[] = [];

  if (input.replaySuiteStatus !== "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_READY") {
    refusalReasons.push("CONTROLLED_REPLAY_SUITE_NOT_READY");
  }

  if (input.replaySuiteScopedCompile !== "PASS") {
    refusalReasons.push("CONTROLLED_REPLAY_SUITE_SCOPED_COMPILE_NOT_PASS");
  }

  if (input.replaySuiteSmoke !== "PASS") {
    refusalReasons.push("CONTROLLED_REPLAY_SUITE_SMOKE_NOT_PASS");
  }

  if (input.requestLiveRails) {
    refusalReasons.push("LIVE_RAIL_REQUEST_REFUSED_AT_PHASE_3_GATE");
  }

  if (input.requestPaymentProcessing) {
    refusalReasons.push("PAYMENT_PROCESSING_REQUEST_REFUSED_AT_PHASE_3_GATE");
  }

  if (input.requestPublicLaunch) {
    refusalReasons.push("PUBLIC_LAUNCH_REQUEST_REFUSED_AT_PHASE_3_GATE");
  }

  if (input.requestRuntimeActivation) {
    refusalReasons.push("RUNTIME_ACTIVATION_REQUEST_REFUSED_AT_PHASE_3_GATE");
  }

  const dependencyClean =
    input.replaySuiteStatus === "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_READY" &&
    input.replaySuiteScopedCompile === "PASS" &&
    input.replaySuiteSmoke === "PASS";

  let decision: Phase3Decision = "BLOCK_LIVE_RAILS";
  let status: Phase3GateStatus = "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_REFUSED";
  let allowedNextLane: SandboxLaunchReadinessEvidencePacket["allowedNextLane"] = "NONE";

  if (dependencyClean && refusalReasons.length === 0 && input.mainApprovalRecorded) {
    decision = "ALLOW_PHASE_3_SANDBOX_DEMO_PREP";
    status = "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_READY";
    allowedNextLane = "SANDBOX_DEMO_PREP_AND_OPERATOR_REVIEW";
  } else if (dependencyClean && refusalReasons.length === 0 && !input.mainApprovalRecorded) {
    decision = "ALLOW_PRIVATE_SANDBOX_REVIEW_ONLY";
    status = "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_READY";
    allowedNextLane = "PRIVATE_SANDBOX_REVIEW_ONLY";
  } else if (dependencyClean && refusalReasons.length > 0) {
    decision = "BLOCK_LIVE_RAILS";
    status = "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_BLOCKED";
    allowedNextLane = "NONE";
  }

  const artifactPath =
    "D:\\DEV\\AIVA\\shared-data\\controlled-sandbox-transaction-replay-suite\\controlled-sandbox-transaction-replay-suite.json";

  const claimToArtifactMap: Phase3ClaimToArtifact[] = [
    {
      claim: "Controlled sandbox replay suite is ready.",
      status: dependencyClean ? "VERIFIED" : "BLOCKED",
      artifactPath,
      proof: input.replaySuiteStatus
    },
    {
      claim: "Sandbox replay suite scoped TypeScript passed.",
      status: input.replaySuiteScopedCompile === "PASS" ? "VERIFIED" : "BLOCKED",
      artifactPath,
      proof: input.replaySuiteScopedCompile
    },
    {
      claim: "Sandbox replay suite smoke passed.",
      status: input.replaySuiteSmoke === "PASS" ? "VERIFIED" : "BLOCKED",
      artifactPath,
      proof: input.replaySuiteSmoke
    },
    {
      claim: "Live rails are not authorized.",
      status: "BLOCKED",
      artifactPath,
      proof: "NO_LIVE_RAILS_CREATED"
    },
    {
      claim: "Payment processing is not authorized.",
      status: "BLOCKED",
      artifactPath,
      proof: "NO_LIVE_PAYMENT_PROCESSING_CREATED"
    },
    {
      claim: "Public launch is not authorized.",
      status: "BLOCKED",
      artifactPath,
      proof: "REPLAY_SUITE_IS_NOT_LAUNCH_APPROVAL"
    },
    {
      claim: "Runtime activation is not authorized.",
      status: "BLOCKED",
      artifactPath,
      proof: "NO_RUNTIME_ACTIVATION_CREATED"
    }
  ];

  return {
    __brand: "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET",
    packetId: "sandbox_launch_readiness_evidence_packet_001",
    status,
    decision,
    dependency: {
      artifactName: "Controlled Sandbox Transaction Replay Suite",
      artifactPath,
      expectedStatus: "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_READY",
      actualStatus: input.replaySuiteStatus,
      scopedCompile: input.replaySuiteScopedCompile,
      smoke: input.replaySuiteSmoke
    },
    claimToArtifactMap,
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
    allowedNextLane,
    humanApprovalRequired: true,
    refusalReasons: unique(refusalReasons),
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
}

export function buildDefaultPhase3EvidencePacket(): SandboxLaunchReadinessEvidencePacket {
  return evaluatePhase3Gate({
    mainApprovalRecorded: false,
    requestLiveRails: false,
    requestPaymentProcessing: false,
    requestPublicLaunch: false,
    requestRuntimeActivation: false,
    replaySuiteStatus: "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_READY",
    replaySuiteScopedCompile: "PASS",
    replaySuiteSmoke: "PASS"
  });
}

export function buildApprovedPhase3SandboxDemoPrepPacket(): SandboxLaunchReadinessEvidencePacket {
  return evaluatePhase3Gate({
    mainApprovalRecorded: true,
    requestLiveRails: false,
    requestPaymentProcessing: false,
    requestPublicLaunch: false,
    requestRuntimeActivation: false,
    replaySuiteStatus: "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_READY",
    replaySuiteScopedCompile: "PASS",
    replaySuiteSmoke: "PASS"
  });
}

export const SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_DOCTRINE = {
  name: "Sandbox Launch Readiness Evidence Packet / Phase 3 Gate",
  class: "PHASE_3_SANDBOX_EVIDENCE_AND_DECISION_GATE",
  purpose:
    "Convert verified sandbox replay evidence into a Phase 3 decision packet while preserving all live, launch, payment, custody, ATS, and runtime activation boundaries.",
  boundary: {
    evidenceOnly: true,
    notLaunchApproval: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noLiveTransactionTruthCreated: true,
    noLiveATSCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true,
    humanApprovalRequired: true
  }
} as const;

