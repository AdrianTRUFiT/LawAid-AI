export type PrivateSandboxReviewStatus =
  | "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_READY"
  | "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_BLOCKED"
  | "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_REFUSED";

export type PrivateSandboxReviewDecision =
  | "ALLOW_PRIVATE_OPERATOR_REVIEW"
  | "ALLOW_SANDBOX_DEMO_PREP_WITH_OPERATOR_REVIEW"
  | "BLOCK_PUBLIC_LAUNCH"
  | "REQUIRE_MAIN_APPROVAL";

export type DemoClaimStatus =
  | "SUPPORTED_BY_ARTIFACT"
  | "BLOCKED_CLAIM"
  | "NOT_ALLOWED";

export type OperatorReviewOutcome =
  | "READY_FOR_PRIVATE_REVIEW"
  | "NEEDS_COPY_REPAIR"
  | "NEEDS_FLOW_REPAIR"
  | "NEEDS_BOUNDARY_REPAIR"
  | "NOT_READY";

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

export interface DemoClaimToArtifactGuard {
  claim: string;
  status: DemoClaimStatus;
  allowedLanguage: string;
  artifactPath: string;
  blockedOverclaim: string;
}

export interface OperatorReviewChecklist {
  readonly __brand: "OPERATOR_REVIEW_CHECKLIST";
  checklistId: string;
  requiredChecks: Array<{
    check: string;
    required: true;
    passCondition: string;
  }>;
  prohibitedClaims: string[];
  requiredBoundaryLanguage: string[];
  boundary: {
    checklistIsReviewOnly: true;
    checklistCreatesNoLaunchAuthority: true;
    checklistCreatesNoPaymentAuthority: true;
    checklistCreatesNoRuntimeActivation: true;
  };
}

export interface SandboxDemoPrepContract {
  readonly __brand: "SANDBOX_DEMO_PREP_CONTRACT";
  contractId: string;
  demoName: string;
  reviewMode: "PRIVATE_OPERATOR_REVIEW_ONLY" | "SANDBOX_DEMO_PREP";
  allowedAudience: "OPERATOR_ONLY" | "PRIVATE_REVIEW_GROUP";
  allowedDemoClaims: DemoClaimToArtifactGuard[];
  blockedCapabilities: string[];
  operatorReviewChecklist: OperatorReviewChecklist;
  boundary: {
    demoIsSandboxOnly: true;
    demoIsNotPublicLaunch: true;
    demoCreatesNoLiveRails: true;
    demoCreatesNoPaymentProcessing: true;
    demoCreatesNoLiveTransactionTruth: true;
    demoCreatesNoLiveATS: true;
    demoCreatesNoCustodyTransfer: true;
    demoCreatesNoRuntimeActivation: true;
    demoCreatesNoLegalFinancialAuthorityClaims: true;
  };
}

export interface PrivateSandboxReviewInput {
  mainApprovalRecorded: boolean;
  requestedPublicLaunch: boolean;
  requestedLiveRails: boolean;
  requestedPaymentProcessing: boolean;
  requestedRuntimeActivation: boolean;
  phase3Status: string;
  phase3ScopedCompile: "PASS" | "FAIL";
  phase3Smoke: "PASS" | "FAIL";
  reviewModeRequested: "PRIVATE_OPERATOR_REVIEW_ONLY" | "SANDBOX_DEMO_PREP";
}

export interface PrivateSandboxReviewDemoPrepPacket {
  readonly __brand: "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_PACKET";
  packetId: string;
  status: PrivateSandboxReviewStatus;
  decision: PrivateSandboxReviewDecision;
  allowedNextLane: "PRIVATE_OPERATOR_REVIEW" | "SANDBOX_DEMO_PREP_OPERATOR_REVIEW" | "NONE";
  demoContract: SandboxDemoPrepContract;
  operatorReviewOutcome: OperatorReviewOutcome;
  refusalReasons: string[];
  humanApprovalRequired: true;
  boundary: {
    packetIsPrivateReviewOnly: true;
    packetIsNotLaunchApproval: true;
    packetCreatesNoLiveRails: true;
    packetCreatesNoPaymentProcessing: true;
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

const phase3ArtifactPath =
  "D:\\DEV\\AIVA\\shared-data\\sandbox-launch-readiness-evidence-packet\\sandbox-launch-readiness-evidence-packet.json";

export function buildOperatorReviewChecklist(): OperatorReviewChecklist {
  return {
    __brand: "OPERATOR_REVIEW_CHECKLIST",
    checklistId: "operator_review_checklist_001",
    requiredChecks: [
      {
        check: "Confirm demo is sandbox-only.",
        required: true,
        passCondition: "Operator can explain that no live rail or live payment is connected."
      },
      {
        check: "Confirm PAI-SAFE remains display only.",
        required: true,
        passCondition: "Operator can identify PAI-SAFE as consumer-facing display, not truth authority."
      },
      {
        check: "Confirm FundTrackerAI remains sandbox truth authority.",
        required: true,
        passCondition: "Operator can identify FundTrackerAI as the only sandbox transaction truth authority."
      },
      {
        check: "Confirm blocked capabilities are visible.",
        required: true,
        passCondition: "Operator sees live rails, payment processing, public launch, custody transfer, and runtime activation as blocked."
      },
      {
        check: "Confirm every demo claim maps to an artifact.",
        required: true,
        passCondition: "Operator can trace each claim to the Phase 3 evidence packet."
      }
    ],
    prohibitedClaims: [
      "This processes live payments.",
      "This connects to live payment rails.",
      "This creates live transaction truth.",
      "This creates live Activated Transaction State.",
      "This authorizes public launch.",
      "This creates custody transfer.",
      "This provides legal or financial authority claims.",
      "PAI-SAFE verifies transaction truth."
    ],
    requiredBoundaryLanguage: [
      "This is a sandbox-only operator review.",
      "No live payment rail is connected.",
      "No live payment is processed.",
      "FundTrackerAI remains the transaction truth authority.",
      "PAI-SAFE is display only.",
      "This review does not authorize launch."
    ],
    boundary: {
      checklistIsReviewOnly: true,
      checklistCreatesNoLaunchAuthority: true,
      checklistCreatesNoPaymentAuthority: true,
      checklistCreatesNoRuntimeActivation: true
    }
  };
}

export function buildDemoClaimGuards(): DemoClaimToArtifactGuard[] {
  return [
    {
      claim: "Sandbox replay suite passed.",
      status: "SUPPORTED_BY_ARTIFACT",
      allowedLanguage: "The controlled sandbox replay suite passed all verified smoke checks.",
      artifactPath: phase3ArtifactPath,
      blockedOverclaim: "The system is ready for live payments."
    },
    {
      claim: "Live rails are blocked.",
      status: "SUPPORTED_BY_ARTIFACT",
      allowedLanguage: "The Phase 3 Gate keeps live rails blocked.",
      artifactPath: phase3ArtifactPath,
      blockedOverclaim: "Live rails are connected."
    },
    {
      claim: "Payment processing is blocked.",
      status: "SUPPORTED_BY_ARTIFACT",
      allowedLanguage: "The demo does not process payments.",
      artifactPath: phase3ArtifactPath,
      blockedOverclaim: "The demo processes real payments."
    },
    {
      claim: "PAI-SAFE is display only.",
      status: "SUPPORTED_BY_ARTIFACT",
      allowedLanguage: "PAI-SAFE displays governed state; it does not create transaction truth.",
      artifactPath: phase3ArtifactPath,
      blockedOverclaim: "PAI-SAFE verifies payment truth."
    },
    {
      claim: "Public launch is not authorized.",
      status: "SUPPORTED_BY_ARTIFACT",
      allowedLanguage: "This packet does not authorize public launch.",
      artifactPath: phase3ArtifactPath,
      blockedOverclaim: "The system is cleared for public launch."
    }
  ];
}

export function buildSandboxDemoPrepContract(
  reviewMode: "PRIVATE_OPERATOR_REVIEW_ONLY" | "SANDBOX_DEMO_PREP"
): SandboxDemoPrepContract {
  return {
    __brand: "SANDBOX_DEMO_PREP_CONTRACT",
    contractId: "sandbox_demo_prep_contract_001",
    demoName: "GTIS / FundTrackerAI Sandbox Transaction Truth Review",
    reviewMode,
    allowedAudience: reviewMode === "PRIVATE_OPERATOR_REVIEW_ONLY" ? "OPERATOR_ONLY" : "PRIVATE_REVIEW_GROUP",
    allowedDemoClaims: buildDemoClaimGuards(),
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
    operatorReviewChecklist: buildOperatorReviewChecklist(),
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
}

export function evaluatePrivateSandboxReviewDemoPrep(
  input: PrivateSandboxReviewInput
): PrivateSandboxReviewDemoPrepPacket {
  const refusalReasons: string[] = [];

  if (input.phase3Status !== "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_READY") {
    refusalReasons.push("PHASE_3_GATE_NOT_READY");
  }

  if (input.phase3ScopedCompile !== "PASS") {
    refusalReasons.push("PHASE_3_SCOPED_COMPILE_NOT_PASS");
  }

  if (input.phase3Smoke !== "PASS") {
    refusalReasons.push("PHASE_3_SMOKE_NOT_PASS");
  }

  if (input.requestedPublicLaunch) {
    refusalReasons.push("PUBLIC_LAUNCH_REQUEST_REFUSED");
  }

  if (input.requestedLiveRails) {
    refusalReasons.push("LIVE_RAIL_REQUEST_REFUSED");
  }

  if (input.requestedPaymentProcessing) {
    refusalReasons.push("PAYMENT_PROCESSING_REQUEST_REFUSED");
  }

  if (input.requestedRuntimeActivation) {
    refusalReasons.push("RUNTIME_ACTIVATION_REQUEST_REFUSED");
  }

  let decision: PrivateSandboxReviewDecision = "REQUIRE_MAIN_APPROVAL";
  let status: PrivateSandboxReviewStatus = "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_BLOCKED";
  let allowedNextLane: PrivateSandboxReviewDemoPrepPacket["allowedNextLane"] = "NONE";
  let operatorReviewOutcome: OperatorReviewOutcome = "NOT_READY";

  const dependencyClean =
    input.phase3Status === "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_READY" &&
    input.phase3ScopedCompile === "PASS" &&
    input.phase3Smoke === "PASS";

  if (dependencyClean && refusalReasons.length === 0 && input.reviewModeRequested === "PRIVATE_OPERATOR_REVIEW_ONLY") {
    decision = "ALLOW_PRIVATE_OPERATOR_REVIEW";
    status = "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_READY";
    allowedNextLane = "PRIVATE_OPERATOR_REVIEW";
    operatorReviewOutcome = "READY_FOR_PRIVATE_REVIEW";
  }

  if (
    dependencyClean &&
    refusalReasons.length === 0 &&
    input.reviewModeRequested === "SANDBOX_DEMO_PREP" &&
    input.mainApprovalRecorded
  ) {
    decision = "ALLOW_SANDBOX_DEMO_PREP_WITH_OPERATOR_REVIEW";
    status = "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_READY";
    allowedNextLane = "SANDBOX_DEMO_PREP_OPERATOR_REVIEW";
    operatorReviewOutcome = "READY_FOR_PRIVATE_REVIEW";
  }

  if (
    dependencyClean &&
    refusalReasons.length === 0 &&
    input.reviewModeRequested === "SANDBOX_DEMO_PREP" &&
    !input.mainApprovalRecorded
  ) {
    decision = "REQUIRE_MAIN_APPROVAL";
    status = "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_BLOCKED";
    allowedNextLane = "PRIVATE_OPERATOR_REVIEW";
    operatorReviewOutcome = "READY_FOR_PRIVATE_REVIEW";
  }

  if (refusalReasons.length > 0) {
    decision = "BLOCK_PUBLIC_LAUNCH";
    status = "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_REFUSED";
    allowedNextLane = "NONE";
    operatorReviewOutcome = "NEEDS_BOUNDARY_REPAIR";
  }

  return {
    __brand: "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_PACKET",
    packetId: "private_sandbox_review_demo_prep_001",
    status,
    decision,
    allowedNextLane,
    demoContract: buildSandboxDemoPrepContract(input.reviewModeRequested),
    operatorReviewOutcome,
    refusalReasons: unique(refusalReasons),
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
}

export function buildDefaultPrivateSandboxReviewPacket(): PrivateSandboxReviewDemoPrepPacket {
  return evaluatePrivateSandboxReviewDemoPrep({
    mainApprovalRecorded: false,
    requestedPublicLaunch: false,
    requestedLiveRails: false,
    requestedPaymentProcessing: false,
    requestedRuntimeActivation: false,
    phase3Status: "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_READY",
    phase3ScopedCompile: "PASS",
    phase3Smoke: "PASS",
    reviewModeRequested: "PRIVATE_OPERATOR_REVIEW_ONLY"
  });
}

export function buildMainApprovedSandboxDemoPrepPacket(): PrivateSandboxReviewDemoPrepPacket {
  return evaluatePrivateSandboxReviewDemoPrep({
    mainApprovalRecorded: true,
    requestedPublicLaunch: false,
    requestedLiveRails: false,
    requestedPaymentProcessing: false,
    requestedRuntimeActivation: false,
    phase3Status: "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_READY",
    phase3ScopedCompile: "PASS",
    phase3Smoke: "PASS",
    reviewModeRequested: "SANDBOX_DEMO_PREP"
  });
}

export const PRIVATE_SANDBOX_REVIEW_DEMO_PREP_DOCTRINE = {
  name: "Private Sandbox Review / Sandbox Demo Prep + Operator Review",
  class: "PRIVATE_SANDBOX_OPERATOR_REVIEW_AND_DEMO_PREP_GATE",
  purpose:
    "Prepare a private operator-safe sandbox review and demo preparation packet while preserving all live, launch, payment, custody, ATS, and runtime activation boundaries.",
  boundary: {
    privateReviewOnly: true,
    notLaunchApproval: true,
    sandboxOnly: true,
    noLiveRailsCreated: true,
    noLivePaymentProcessingCreated: true,
    noLiveTransactionTruthCreated: true,
    noLiveATSCreated: true,
    noCustodyTransferCreated: true,
    noRuntimeActivationCreated: true,
    noLegalFinancialAuthorityClaimsCreated: true
  }
} as const;
