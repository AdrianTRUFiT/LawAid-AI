import {
  buildDefaultPrivateSandboxReviewPacket,
  buildMainApprovedSandboxDemoPrepPacket,
  buildOperatorReviewChecklist,
  buildSandboxDemoPrepContract,
  evaluatePrivateSandboxReviewDemoPrep,
  PRIVATE_SANDBOX_REVIEW_DEMO_PREP_DOCTRINE
} from "../private-sandbox-review-demo-prep";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(PRIVATE_SANDBOX_REVIEW_DEMO_PREP_DOCTRINE.boundary.privateReviewOnly === true, "Doctrine locks private review only");
assert(PRIVATE_SANDBOX_REVIEW_DEMO_PREP_DOCTRINE.boundary.notLaunchApproval === true, "Doctrine blocks launch approval");
assert(PRIVATE_SANDBOX_REVIEW_DEMO_PREP_DOCTRINE.boundary.sandboxOnly === true, "Doctrine locks sandbox only");
assert(PRIVATE_SANDBOX_REVIEW_DEMO_PREP_DOCTRINE.boundary.noLiveRailsCreated === true, "Doctrine creates no live rails");
assert(PRIVATE_SANDBOX_REVIEW_DEMO_PREP_DOCTRINE.boundary.noLivePaymentProcessingCreated === true, "Doctrine creates no payment processing");
assert(PRIVATE_SANDBOX_REVIEW_DEMO_PREP_DOCTRINE.boundary.noLiveTransactionTruthCreated === true, "Doctrine creates no live truth");
assert(PRIVATE_SANDBOX_REVIEW_DEMO_PREP_DOCTRINE.boundary.noLiveATSCreated === true, "Doctrine creates no live ATS");
assert(PRIVATE_SANDBOX_REVIEW_DEMO_PREP_DOCTRINE.boundary.noRuntimeActivationCreated === true, "Doctrine creates no runtime activation");

const checklist = buildOperatorReviewChecklist();

assert(checklist.requiredChecks.length >= 5, "Operator checklist has required checks");
assert(checklist.prohibitedClaims.includes("This processes live payments."), "Checklist blocks live payment claim");
assert(checklist.prohibitedClaims.includes("PAI-SAFE verifies transaction truth."), "Checklist blocks PAI-SAFE truth claim");
assert(checklist.requiredBoundaryLanguage.includes("This review does not authorize launch."), "Checklist requires no-launch language");
assert(checklist.boundary.checklistCreatesNoLaunchAuthority === true, "Checklist creates no launch authority");

const privateContract = buildSandboxDemoPrepContract("PRIVATE_OPERATOR_REVIEW_ONLY");

assert(privateContract.reviewMode === "PRIVATE_OPERATOR_REVIEW_ONLY", "Private contract review mode correct");
assert(privateContract.allowedAudience === "OPERATOR_ONLY", "Private contract operator-only audience");
assert(privateContract.allowedDemoClaims.length >= 5, "Private contract has claim guards");
assert(privateContract.blockedCapabilities.includes("LIVE_RAIL_CONNECTION"), "Private contract blocks live rails");
assert(privateContract.blockedCapabilities.includes("PUBLIC_LAUNCH"), "Private contract blocks public launch");
assert(privateContract.boundary.demoCreatesNoLiveRails === true, "Private contract creates no live rails");
assert(privateContract.boundary.demoCreatesNoRuntimeActivation === true, "Private contract creates no runtime activation");

const defaultPacket = buildDefaultPrivateSandboxReviewPacket();

assert(defaultPacket.status === "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_READY", "Default private sandbox review packet ready");
assert(defaultPacket.decision === "ALLOW_PRIVATE_OPERATOR_REVIEW", "Default decision allows private operator review");
assert(defaultPacket.allowedNextLane === "PRIVATE_OPERATOR_REVIEW", "Default next lane private operator review");
assert(defaultPacket.operatorReviewOutcome === "READY_FOR_PRIVATE_REVIEW", "Default operator review outcome ready");
assert(defaultPacket.humanApprovalRequired === true, "Default packet keeps human approval required");
assert(defaultPacket.boundary.packetIsNotLaunchApproval === true, "Default packet is not launch approval");

const approvedDemo = buildMainApprovedSandboxDemoPrepPacket();

assert(approvedDemo.status === "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_READY", "MAIN-approved sandbox demo prep packet ready");
assert(approvedDemo.decision === "ALLOW_SANDBOX_DEMO_PREP_WITH_OPERATOR_REVIEW", "MAIN-approved decision allows sandbox demo prep");
assert(approvedDemo.allowedNextLane === "SANDBOX_DEMO_PREP_OPERATOR_REVIEW", "MAIN-approved next lane sandbox demo prep operator review");
assert(approvedDemo.demoContract.allowedAudience === "PRIVATE_REVIEW_GROUP", "MAIN-approved demo allows private review group");
assert(approvedDemo.boundary.packetCreatesNoPaymentProcessing === true, "MAIN-approved packet creates no payment processing");

const demoWithoutMain = evaluatePrivateSandboxReviewDemoPrep({
  mainApprovalRecorded: false,
  requestedPublicLaunch: false,
  requestedLiveRails: false,
  requestedPaymentProcessing: false,
  requestedRuntimeActivation: false,
  phase3Status: "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_READY",
  phase3ScopedCompile: "PASS",
  phase3Smoke: "PASS",
  reviewModeRequested: "SANDBOX_DEMO_PREP"
});

assert(demoWithoutMain.status === "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_BLOCKED", "Sandbox demo prep without MAIN approval blocked");
assert(demoWithoutMain.decision === "REQUIRE_MAIN_APPROVAL", "Sandbox demo prep without MAIN requires approval");
assert(demoWithoutMain.allowedNextLane === "PRIVATE_OPERATOR_REVIEW", "Sandbox demo prep without MAIN falls back to private operator review");

const liveAttempt = evaluatePrivateSandboxReviewDemoPrep({
  mainApprovalRecorded: true,
  requestedPublicLaunch: true,
  requestedLiveRails: true,
  requestedPaymentProcessing: true,
  requestedRuntimeActivation: true,
  phase3Status: "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_READY",
  phase3ScopedCompile: "PASS",
  phase3Smoke: "PASS",
  reviewModeRequested: "SANDBOX_DEMO_PREP"
});

assert(liveAttempt.status === "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_REFUSED", "Live/public/runtime attempt refused");
assert(liveAttempt.decision === "BLOCK_PUBLIC_LAUNCH", "Live attempt blocks public launch");
assert(liveAttempt.allowedNextLane === "NONE", "Live attempt opens no next lane");
assert(liveAttempt.refusalReasons.includes("PUBLIC_LAUNCH_REQUEST_REFUSED"), "Public launch refusal recorded");
assert(liveAttempt.refusalReasons.includes("LIVE_RAIL_REQUEST_REFUSED"), "Live rail refusal recorded");
assert(liveAttempt.refusalReasons.includes("PAYMENT_PROCESSING_REQUEST_REFUSED"), "Payment processing refusal recorded");
assert(liveAttempt.refusalReasons.includes("RUNTIME_ACTIVATION_REQUEST_REFUSED"), "Runtime activation refusal recorded");

const dependencyFail = evaluatePrivateSandboxReviewDemoPrep({
  mainApprovalRecorded: true,
  requestedPublicLaunch: false,
  requestedLiveRails: false,
  requestedPaymentProcessing: false,
  requestedRuntimeActivation: false,
  phase3Status: "SANDBOX_LAUNCH_READINESS_EVIDENCE_PACKET_REFUSED",
  phase3ScopedCompile: "PASS",
  phase3Smoke: "PASS",
  reviewModeRequested: "SANDBOX_DEMO_PREP"
});

assert(dependencyFail.status === "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_REFUSED", "Dependency failure refused");
assert(dependencyFail.refusalReasons.includes("PHASE_3_GATE_NOT_READY"), "Dependency failure records Phase 3 not ready");

const noLiveLeak =
  approvedDemo.boundary.packetCreatesNoLiveRails === true &&
  approvedDemo.boundary.packetCreatesNoPaymentProcessing === true &&
  approvedDemo.boundary.packetCreatesNoLiveTransactionTruth === true &&
  approvedDemo.boundary.packetCreatesNoLiveATS === true &&
  approvedDemo.boundary.packetCreatesNoCustodyTransfer === true &&
  approvedDemo.boundary.packetCreatesNoRuntimeActivation === true &&
  approvedDemo.boundary.packetIsNotLaunchApproval === true;

assert(noLiveLeak === true, "No live capability leaked from private sandbox review demo prep");

console.log("");
console.log("PRIVATE_SANDBOX_REVIEW_DEMO_PREP_SMOKE=PASS");
