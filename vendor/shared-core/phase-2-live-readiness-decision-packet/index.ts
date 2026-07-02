export type Phase2DecisionPacketStatus =
  | "PHASE_2_LIVE_READINESS_DECISION_PACKET_READY"
  | "PHASE_2_LIVE_READINESS_DECISION_PACKET_BLOCKED";

export type ProcessorRailTarget =
  | "UNDECIDED"
  | "STRIPE_SANDBOX"
  | "STRIPE_LIVE"
  | "PAYPAL_SANDBOX"
  | "ACH_SANDBOX"
  | "BANK_TRANSFER_MANUAL"
  | "NO_RAIL_SELECTED";

export type MerchantEntityPosture =
  | "UNDECIDED"
  | "EXISTING_ENTITY_REVIEW_REQUIRED"
  | "NEW_ENTITY_REQUIRED"
  | "SOLE_PROPRIETOR_NOT_APPROVED"
  | "ENTITY_READY_FOR_SANDBOX_ONLY"
  | "ENTITY_READY_FOR_LIVE_REVIEW";

export type PciScopePosture =
  | "UNDECIDED"
  | "NO_CARD_DATA_TOUCH"
  | "HOSTED_CHECKOUT_ONLY"
  | "TOKEN_ONLY"
  | "PCI_REVIEW_REQUIRED"
  | "PCI_SCOPE_NOT_APPROVED";

export type FirstTransactionType =
  | "UNDECIDED"
  | "READ_ONLY_DEMO_NO_MONEY"
  | "SANDBOX_TEST_PAYMENT"
  | "SMALL_DOLLAR_INTERNAL_TEST"
  | "INVITE_ONLY_BETA_PAYMENT"
  | "PUBLIC_PAYMENT_NOT_ALLOWED";

export type FirstActivationEnvironment =
  | "UNDECIDED"
  | "LOCAL_ONLY"
  | "SANDBOX_ONLY"
  | "PRIVATE_BETA_ONLY"
  | "PUBLIC_LIVE_NOT_ALLOWED";

export type FundTrackerMutationScope =
  | "NONE"
  | "SANDBOX_STATE_ONLY"
  | "INTERNAL_TEST_STATE_ONLY"
  | "PRIVATE_BETA_STATE_WITH_HUMAN_APPROVAL"
  | "LIVE_STATE_NOT_APPROVED";

export type ActivatedTransactionStateReality =
  | "MOCK_ONLY"
  | "SANDBOX_ATS_ONLY"
  | "INTERNAL_TEST_ATS_ONLY"
  | "PRIVATE_BETA_ATS_WITH_HUMAN_APPROVAL"
  | "LIVE_ATS_NOT_APPROVED";

export type Phase2GateDecision =
  | "BLOCK_LIVE_RAILS"
  | "ALLOW_SANDBOX_PREP"
  | "ALLOW_INTERNAL_TEST_PREP"
  | "ALLOW_PRIVATE_BETA_PREP"
  | "REQUIRE_MAIN_RULING";

export interface LiveRailAuthority {
  readonly __brand: "LIVE_RAIL_AUTHORITY";
  mayConnectLiveRails: true;
}

export interface PaymentProcessingAuthority {
  readonly __brand: "PAYMENT_PROCESSING_AUTHORITY";
  mayProcessPayment: true;
}

export interface TransactionMutationAuthority {
  readonly __brand: "TRANSACTION_MUTATION_AUTHORITY";
  mayMutateTransactionState: true;
}

export interface ActivatedTransactionStateAuthority {
  readonly __brand: "ACTIVATED_TRANSACTION_STATE_AUTHORITY";
  mayCreateATS: true;
}

export interface Phase2DecisionInput {
  processorRailTarget: ProcessorRailTarget;
  merchantEntityPosture: MerchantEntityPosture;
  pciScopePosture: PciScopePosture;
  firstTransactionType: FirstTransactionType;
  firstActivationEnvironment: FirstActivationEnvironment;
  fundTrackerMutationScope: FundTrackerMutationScope;
  activatedTransactionStateReality: ActivatedTransactionStateReality;
  mainHumanApprovalRecorded: boolean;
  liveRailRequested: boolean;
  processorWorkRequested: boolean;
  paymentProcessingRequested: boolean;
  publicLaunchRequested: boolean;
}

export interface Phase2ReadinessDecisionPacket {
  readonly __brand: "PHASE_2_LIVE_READINESS_DECISION_PACKET";
  packetId: string;
  status: Phase2DecisionPacketStatus;
  gateDecision: Phase2GateDecision;
  input: Phase2DecisionInput;
  allowedNextBuildLane:
    | "NONE"
    | "FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY"
    | "FUNDTRACKERAI_INTERNAL_TEST_TRANSACTION_AUTHORITY"
    | "PRIVATE_BETA_TRANSACTION_AUTHORITY_PREP";
  blockedReasons: string[];
  requiredMainRulings: string[];
  phase2Scope: {
    processorRailSelected: boolean;
    merchantEntityPostureSelected: boolean;
    pciScopeSelected: boolean;
    firstTransactionTypeSelected: boolean;
    firstActivationEnvironmentSelected: boolean;
    fundTrackerMutationScopeSelected: boolean;
    atsRealitySelected: boolean;
  };
  boundary: {
    packetCreatesNoLiveRails: true;
    packetCreatesNoPaymentAuthority: true;
    packetCreatesNoTransactionTruth: true;
    packetCreatesNoTransactionMutation: true;
    packetCreatesNoActivatedTransactionState: true;
    packetCreatesNoCustodyTransfer: true;
    packetCreatesNoRuntimeActivation: true;
    packetDoesNotAuthorizePublicLaunch: true;
    packetIsDecisionGateOnly: true;
  };
}

function selected(value: string): boolean {
  return value !== "UNDECIDED" && value !== "NO_RAIL_SELECTED";
}

function unique<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

export function evaluatePhase2LiveReadinessDecision(
  input: Phase2DecisionInput
): Phase2ReadinessDecisionPacket {
  const blockedReasons: string[] = [];
  const requiredMainRulings: string[] = [];

  if (!input.mainHumanApprovalRecorded) {
    blockedReasons.push("MAIN_HUMAN_APPROVAL_REQUIRED");
    requiredMainRulings.push("MAIN must approve Phase 2 scope before any next build lane opens.");
  }

  if (input.processorRailTarget === "UNDECIDED" || input.processorRailTarget === "NO_RAIL_SELECTED") {
    blockedReasons.push("PROCESSOR_RAIL_TARGET_REQUIRED");
    requiredMainRulings.push("Select processor / rail target.");
  }

  if (input.merchantEntityPosture === "UNDECIDED") {
    blockedReasons.push("MERCHANT_ENTITY_POSTURE_REQUIRED");
    requiredMainRulings.push("Decide merchant / entity posture.");
  }

  if (input.pciScopePosture === "UNDECIDED") {
    blockedReasons.push("PCI_SCOPE_POSTURE_REQUIRED");
    requiredMainRulings.push("Decide PCI scope posture.");
  }

  if (input.firstTransactionType === "UNDECIDED") {
    blockedReasons.push("FIRST_TRANSACTION_TYPE_REQUIRED");
    requiredMainRulings.push("Decide first transaction type.");
  }

  if (input.firstActivationEnvironment === "UNDECIDED") {
    blockedReasons.push("FIRST_ACTIVATION_ENVIRONMENT_REQUIRED");
    requiredMainRulings.push("Decide first activation environment.");
  }

  if (input.fundTrackerMutationScope === "NONE" || input.fundTrackerMutationScope === "LIVE_STATE_NOT_APPROVED") {
    blockedReasons.push("FUNDTRACKER_MUTATION_SCOPE_NOT_OPEN");
    requiredMainRulings.push("Define what FundTrackerAI is allowed to mutate.");
  }

  if (input.activatedTransactionStateReality === "LIVE_ATS_NOT_APPROVED") {
    blockedReasons.push("LIVE_ATS_NOT_APPROVED");
  }

  if (input.liveRailRequested) {
    blockedReasons.push("LIVE_RAIL_REQUEST_REFUSED_AT_DECISION_PACKET");
  }

  if (input.paymentProcessingRequested) {
    blockedReasons.push("PAYMENT_PROCESSING_REQUEST_REFUSED_AT_DECISION_PACKET");
  }

  if (input.publicLaunchRequested) {
    blockedReasons.push("PUBLIC_LAUNCH_REQUEST_REFUSED_AT_DECISION_PACKET");
  }

  if (
    input.processorRailTarget.includes("LIVE") ||
    input.firstActivationEnvironment === "PUBLIC_LIVE_NOT_ALLOWED" ||
    input.firstTransactionType === "PUBLIC_PAYMENT_NOT_ALLOWED"
  ) {
    blockedReasons.push("PUBLIC_OR_LIVE_SCOPE_NOT_ALLOWED_IN_THIS_PACKET");
  }

  const allSelected =
    selected(input.processorRailTarget) &&
    input.merchantEntityPosture !== "UNDECIDED" &&
    input.pciScopePosture !== "UNDECIDED" &&
    input.firstTransactionType !== "UNDECIDED" &&
    input.firstActivationEnvironment !== "UNDECIDED" &&
    input.fundTrackerMutationScope !== "NONE" &&
    input.activatedTransactionStateReality !== "LIVE_ATS_NOT_APPROVED";

  let gateDecision: Phase2GateDecision = "REQUIRE_MAIN_RULING";
  let allowedNextBuildLane: Phase2ReadinessDecisionPacket["allowedNextBuildLane"] = "NONE";

  const clean = blockedReasons.length === 0 && allSelected && input.mainHumanApprovalRecorded;

  if (!clean) {
    gateDecision = "BLOCK_LIVE_RAILS";
    allowedNextBuildLane = "NONE";
  } else if (
    input.processorRailTarget.endsWith("SANDBOX") &&
    input.firstTransactionType === "SANDBOX_TEST_PAYMENT" &&
    input.firstActivationEnvironment === "SANDBOX_ONLY" &&
    input.fundTrackerMutationScope === "SANDBOX_STATE_ONLY" &&
    input.activatedTransactionStateReality === "SANDBOX_ATS_ONLY"
  ) {
    gateDecision = "ALLOW_SANDBOX_PREP";
    allowedNextBuildLane = "FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY";
  } else if (
    input.firstTransactionType === "SMALL_DOLLAR_INTERNAL_TEST" &&
    input.firstActivationEnvironment === "LOCAL_ONLY" &&
    input.fundTrackerMutationScope === "INTERNAL_TEST_STATE_ONLY" &&
    input.activatedTransactionStateReality === "INTERNAL_TEST_ATS_ONLY"
  ) {
    gateDecision = "ALLOW_INTERNAL_TEST_PREP";
    allowedNextBuildLane = "FUNDTRACKERAI_INTERNAL_TEST_TRANSACTION_AUTHORITY";
  } else if (
    input.firstTransactionType === "INVITE_ONLY_BETA_PAYMENT" &&
    input.firstActivationEnvironment === "PRIVATE_BETA_ONLY" &&
    input.fundTrackerMutationScope === "PRIVATE_BETA_STATE_WITH_HUMAN_APPROVAL" &&
    input.activatedTransactionStateReality === "PRIVATE_BETA_ATS_WITH_HUMAN_APPROVAL"
  ) {
    gateDecision = "ALLOW_PRIVATE_BETA_PREP";
    allowedNextBuildLane = "PRIVATE_BETA_TRANSACTION_AUTHORITY_PREP";
  } else {
    gateDecision = "REQUIRE_MAIN_RULING";
    allowedNextBuildLane = "NONE";
    requiredMainRulings.push("Input combination does not match an approved next build lane.");
  }

  const status: Phase2DecisionPacketStatus =
    gateDecision === "ALLOW_SANDBOX_PREP" ||
    gateDecision === "ALLOW_INTERNAL_TEST_PREP" ||
    gateDecision === "ALLOW_PRIVATE_BETA_PREP"
      ? "PHASE_2_LIVE_READINESS_DECISION_PACKET_READY"
      : "PHASE_2_LIVE_READINESS_DECISION_PACKET_BLOCKED";

  return {
    __brand: "PHASE_2_LIVE_READINESS_DECISION_PACKET",
    packetId: "phase_2_live_readiness_decision_packet_001",
    status,
    gateDecision,
    input,
    allowedNextBuildLane,
    blockedReasons: unique(blockedReasons),
    requiredMainRulings: unique(requiredMainRulings),
    phase2Scope: {
      processorRailSelected: selected(input.processorRailTarget),
      merchantEntityPostureSelected: input.merchantEntityPosture !== "UNDECIDED",
      pciScopeSelected: input.pciScopePosture !== "UNDECIDED",
      firstTransactionTypeSelected: input.firstTransactionType !== "UNDECIDED",
      firstActivationEnvironmentSelected: input.firstActivationEnvironment !== "UNDECIDED",
      fundTrackerMutationScopeSelected: input.fundTrackerMutationScope !== "NONE",
      atsRealitySelected: input.activatedTransactionStateReality !== "LIVE_ATS_NOT_APPROVED"
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
}

export function buildDefaultBlockedDecisionPacket(): Phase2ReadinessDecisionPacket {
  return evaluatePhase2LiveReadinessDecision({
    processorRailTarget: "UNDECIDED",
    merchantEntityPosture: "UNDECIDED",
    pciScopePosture: "UNDECIDED",
    firstTransactionType: "UNDECIDED",
    firstActivationEnvironment: "UNDECIDED",
    fundTrackerMutationScope: "NONE",
    activatedTransactionStateReality: "MOCK_ONLY",
    mainHumanApprovalRecorded: false,
    liveRailRequested: false,
    processorWorkRequested: false,
    paymentProcessingRequested: false,
    publicLaunchRequested: false
  });
}

export function buildSandboxPrepDecisionPacket(): Phase2ReadinessDecisionPacket {
  return evaluatePhase2LiveReadinessDecision({
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
  });
}

export const PHASE_2_LIVE_READINESS_DECISION_DOCTRINE = {
  name: "Phase 2 Live Readiness Decision Packet",
  class: "LIVE_SCOPE_DECISION_GATE",
  purpose:
    "Decide the approved scope for moving from read-only validation into sandbox or controlled transaction authority preparation without creating live rails or payment authority.",
  boundary: {
    decisionGateOnly: true,
    noLiveRailsCreated: true,
    noPaymentProcessingCreated: true,
    noTransactionTruthCreated: true,
    noStateMutationCreated: true,
    noATSCreated: true,
    mainApprovalRequired: true
  }
} as const;
