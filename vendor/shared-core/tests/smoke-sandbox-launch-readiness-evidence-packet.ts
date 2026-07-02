import {
  buildApprovedPhase3SandboxDemoPrepPacket,
  buildDefaultPhase3EvidencePacket,
  evaluatePhase3Gate,
  SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_DOCTRINE
} from "../sandbox-launch-readiness-evidence-packet";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_DOCTRINE.boundary.evidenceOnly === true, "Doctrine locks packet as evidence only");
assert(SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_DOCTRINE.boundary.notLaunchApproval === true, "Doctrine blocks launch approval");
assert(SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_DOCTRINE.boundary.noLiveRailsCreated === true, "Doctrine creates no live rails");
assert(SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_DOCTRINE.boundary.noLivePaymentProcessingCreated === true, "Doctrine creates no live payment processing");
assert(SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_DOCTRINE.boundary.noLiveTransactionTruthCreated === true, "Doctrine creates no live truth");
assert(SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_DOCTRINE.boundary.noLiveATSCreated === true, "Doctrine creates no live ATS");
assert(SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_DOCTRINE.boundary.noRuntimeActivationCreated === true, "Doctrine creates no runtime activation");
assert(SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_DOCTRINE.boundary.humanApprovalRequired === true, "Doctrine requires human approval");

const defaultPacket = buildDefaultPhase3EvidencePacket();

assert(defaultPacket.status === "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_READY", "Default Phase 3 packet ready");
assert(defaultPacket.decision === "ALLOW_PRIVATE_SANDBOX_REVIEW_ONLY", "Default packet allows private sandbox review only");
assert(defaultPacket.allowedNextLane === "PRIVATE_SANDBOX_REVIEW_ONLY", "Default next lane is private sandbox review only");
assert(defaultPacket.humanApprovalRequired === true, "Default packet still requires human approval");
assert(defaultPacket.blockedCapabilities.includes("LIVE_RAIL_CONNECTION"), "Live rail remains blocked");
assert(defaultPacket.blockedCapabilities.includes("LIVE_PAYMENT_PROCESSING"), "Payment processing remains blocked");
assert(defaultPacket.blockedCapabilities.includes("PUBLIC_LAUNCH"), "Public launch remains blocked");
assert(defaultPacket.boundary.packetIsNotLaunchApproval === true, "Default packet is not launch approval");
assert(defaultPacket.boundary.packetCreatesNoLiveRails === true, "Default packet creates no live rails");

const approvedPacket = buildApprovedPhase3SandboxDemoPrepPacket();

assert(approvedPacket.status === "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_READY", "Approved Phase 3 sandbox demo packet ready");
assert(approvedPacket.decision === "ALLOW_PHASE_3_SANDBOX_DEMO_PREP", "Approved packet allows sandbox demo prep");
assert(approvedPacket.allowedNextLane === "SANDBOX_DEMO_PREP_AND_OPERATOR_REVIEW", "Approved next lane sandbox demo prep");
assert(approvedPacket.humanApprovalRequired === true, "Approved packet still records human approval requirement");
assert(approvedPacket.boundary.packetCreatesNoRuntimeActivation === true, "Approved packet creates no runtime activation");

const liveRequest = evaluatePhase3Gate({
  mainApprovalRecorded: true,
  requestLiveRails: true,
  requestPaymentProcessing: true,
  requestPublicLaunch: true,
  requestRuntimeActivation: true,
  replaySuiteStatus: "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_READY",
  replaySuiteScopedCompile: "PASS",
  replaySuiteSmoke: "PASS"
});

assert(liveRequest.status === "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_BLOCKED", "Live request blocked at Phase 3 gate");
assert(liveRequest.decision === "BLOCK_LIVE_RAILS", "Live request decision blocks live rails");
assert(liveRequest.allowedNextLane === "NONE", "Live request opens no next lane");
assert(liveRequest.refusalReasons.includes("LIVE_RAIL_REQUEST_REFUSED_AT_PHASE_3_GATE"), "Live rail request refusal recorded");
assert(liveRequest.refusalReasons.includes("PAYMENT_PROCESSING_REQUEST_REFUSED_AT_PHASE_3_GATE"), "Payment processing request refusal recorded");
assert(liveRequest.refusalReasons.includes("PUBLIC_LAUNCH_REQUEST_REFUSED_AT_PHASE_3_GATE"), "Public launch refusal recorded");
assert(liveRequest.refusalReasons.includes("RUNTIME_ACTIVATION_REQUEST_REFUSED_AT_PHASE_3_GATE"), "Runtime activation refusal recorded");

const dependencyFail = evaluatePhase3Gate({
  mainApprovalRecorded: true,
  requestLiveRails: false,
  requestPaymentProcessing: false,
  requestPublicLaunch: false,
  requestRuntimeActivation: false,
  replaySuiteStatus: "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_REFUSED",
  replaySuiteScopedCompile: "PASS",
  replaySuiteSmoke: "PASS"
});

assert(dependencyFail.status === "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_REFUSED", "Dependency failure refuses packet");
assert(dependencyFail.refusalReasons.includes("CONTROLLED_REPLAY_SUITE_NOT_READY"), "Dependency failure records replay suite not ready");

const verifiedClaims = approvedPacket.claimToArtifactMap.filter((claim) => claim.status === "VERIFIED").length;
const blockedClaims = approvedPacket.claimToArtifactMap.filter((claim) => claim.status === "BLOCKED").length;

assert(verifiedClaims >= 3, "Claim map has verified evidence claims");
assert(blockedClaims >= 4, "Claim map has blocked capability claims");

const noLiveLeak =
  approvedPacket.boundary.packetCreatesNoLiveRails === true &&
  approvedPacket.boundary.packetCreatesNoLivePaymentProcessing === true &&
  approvedPacket.boundary.packetCreatesNoLiveTransactionTruth === true &&
  approvedPacket.boundary.packetCreatesNoLiveATS === true &&
  approvedPacket.boundary.packetCreatesNoCustodyTransfer === true &&
  approvedPacket.boundary.packetCreatesNoRuntimeActivation === true &&
  approvedPacket.boundary.packetIsNotLaunchApproval === true;

assert(noLiveLeak === true, "No live capability leaked from Phase 3 gate");

console.log("");
console.log("SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_SMOKE=PASS");
