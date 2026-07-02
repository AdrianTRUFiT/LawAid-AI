import {
  buildDefaultBlockedDecisionPacket,
  buildSandboxPrepDecisionPacket,
  evaluatePhase2LiveReadinessDecision,
  PHASE_2_LIVE_READINESS_DECISION_DOCTRINE
} from "../phase-2-live-readiness-decision-packet";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(PHASE_2_LIVE_READINESS_DECISION_DOCTRINE.boundary.decisionGateOnly === true, "Doctrine locks decision gate only");
assert(PHASE_2_LIVE_READINESS_DECISION_DOCTRINE.boundary.noLiveRailsCreated === true, "Doctrine creates no live rails");
assert(PHASE_2_LIVE_READINESS_DECISION_DOCTRINE.boundary.noPaymentProcessingCreated === true, "Doctrine creates no payment processing");
assert(PHASE_2_LIVE_READINESS_DECISION_DOCTRINE.boundary.noTransactionTruthCreated === true, "Doctrine creates no transaction truth");
assert(PHASE_2_LIVE_READINESS_DECISION_DOCTRINE.boundary.noStateMutationCreated === true, "Doctrine creates no state mutation");
assert(PHASE_2_LIVE_READINESS_DECISION_DOCTRINE.boundary.noATSCreated === true, "Doctrine creates no ATS");
assert(PHASE_2_LIVE_READINESS_DECISION_DOCTRINE.boundary.mainApprovalRequired === true, "Doctrine requires MAIN approval");

const blocked = buildDefaultBlockedDecisionPacket();

assert(blocked.status === "PHASE_2_LIVE_READINESS_DECISION_PACKET_BLOCKED", "Default packet blocked");
assert(blocked.gateDecision === "BLOCK_LIVE_RAILS", "Default blocks live rails");
assert(blocked.allowedNextBuildLane === "NONE", "Default opens no build lane");
assert(blocked.blockedReasons.includes("MAIN_HUMAN_APPROVAL_REQUIRED"), "MAIN approval required");
assert(blocked.blockedReasons.includes("PROCESSOR_RAIL_TARGET_REQUIRED"), "Processor rail target required");
assert(blocked.blockedReasons.includes("MERCHANT_ENTITY_POSTURE_REQUIRED"), "Merchant posture required");
assert(blocked.blockedReasons.includes("PCI_SCOPE_POSTURE_REQUIRED"), "PCI posture required");
assert(blocked.boundary.packetCreatesNoLiveRails === true, "Blocked packet creates no live rails");
assert(blocked.boundary.packetCreatesNoPaymentAuthority === true, "Blocked packet creates no payment authority");

const sandbox = buildSandboxPrepDecisionPacket();

assert(sandbox.status === "PHASE_2_LIVE_READINESS_DECISION_PACKET_READY", "Sandbox prep packet ready");
assert(sandbox.gateDecision === "ALLOW_SANDBOX_PREP", "Sandbox prep allowed");
assert(sandbox.allowedNextBuildLane === "FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY", "Sandbox transaction authority lane opens");
assert(sandbox.blockedReasons.length === 0, "Sandbox packet has no blocked reasons");
assert(sandbox.phase2Scope.processorRailSelected === true, "Sandbox processor selected");
assert(sandbox.phase2Scope.pciScopeSelected === true, "Sandbox PCI posture selected");
assert(sandbox.phase2Scope.fundTrackerMutationScopeSelected === true, "Sandbox mutation scope selected");
assert(sandbox.boundary.packetCreatesNoTransactionTruth === true, "Sandbox decision packet creates no transaction truth");
assert(sandbox.boundary.packetCreatesNoTransactionMutation === true, "Sandbox decision packet creates no state mutation");
assert(sandbox.boundary.packetCreatesNoActivatedTransactionState === true, "Sandbox decision packet creates no ATS");

const liveRailAttempt = evaluatePhase2LiveReadinessDecision({
  processorRailTarget: "STRIPE_LIVE",
  merchantEntityPosture: "ENTITY_READY_FOR_LIVE_REVIEW",
  pciScopePosture: "PCI_REVIEW_REQUIRED",
  firstTransactionType: "INVITE_ONLY_BETA_PAYMENT",
  firstActivationEnvironment: "PRIVATE_BETA_ONLY",
  fundTrackerMutationScope: "PRIVATE_BETA_STATE_WITH_HUMAN_APPROVAL",
  activatedTransactionStateReality: "PRIVATE_BETA_ATS_WITH_HUMAN_APPROVAL",
  mainHumanApprovalRecorded: true,
  liveRailRequested: true,
  processorWorkRequested: true,
  paymentProcessingRequested: true,
  publicLaunchRequested: false
});

assert(liveRailAttempt.status === "PHASE_2_LIVE_READINESS_DECISION_PACKET_BLOCKED", "Live rail attempt blocked");
assert(liveRailAttempt.blockedReasons.includes("LIVE_RAIL_REQUEST_REFUSED_AT_DECISION_PACKET"), "Live rail request refused");
assert(liveRailAttempt.blockedReasons.includes("PAYMENT_PROCESSING_REQUEST_REFUSED_AT_DECISION_PACKET"), "Payment processing refused");
assert(liveRailAttempt.boundary.packetCreatesNoLiveRails === true, "Live attempt creates no live rails");

const internalTest = evaluatePhase2LiveReadinessDecision({
  processorRailTarget: "BANK_TRANSFER_MANUAL",
  merchantEntityPosture: "EXISTING_ENTITY_REVIEW_REQUIRED",
  pciScopePosture: "NO_CARD_DATA_TOUCH",
  firstTransactionType: "SMALL_DOLLAR_INTERNAL_TEST",
  firstActivationEnvironment: "LOCAL_ONLY",
  fundTrackerMutationScope: "INTERNAL_TEST_STATE_ONLY",
  activatedTransactionStateReality: "INTERNAL_TEST_ATS_ONLY",
  mainHumanApprovalRecorded: true,
  liveRailRequested: false,
  processorWorkRequested: false,
  paymentProcessingRequested: false,
  publicLaunchRequested: false
});

assert(internalTest.status === "PHASE_2_LIVE_READINESS_DECISION_PACKET_READY", "Internal test packet ready");
assert(internalTest.gateDecision === "ALLOW_INTERNAL_TEST_PREP", "Internal test prep allowed");
assert(internalTest.allowedNextBuildLane === "FUNDTRACKERAI_INTERNAL_TEST_TRANSACTION_AUTHORITY", "Internal test lane opens");

console.log("");
console.log("PHASE_2_LIVE_READINESS_DECISION_PACKET_SMOKE=PASS");
