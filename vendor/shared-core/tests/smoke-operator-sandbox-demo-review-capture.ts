import {
  buildBoundaryFailingOperatorResponses,
  buildOperatorReviewCaptureForm,
  buildOperatorSandboxDemoReviewCapturePacket,
  buildOperatorSandboxDemoScript,
  buildPassingOperatorResponses,
  OPERATOR_SANDBOX_DEMO_REVIEW_CAPTURE_DOCTRINE,
  scoreOperatorReviewCapture
} from "../operator-sandbox-demo-review-capture";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(OPERATOR_SANDBOX_DEMO_REVIEW_CAPTURE_DOCTRINE.boundary.reviewOnly === true, "Doctrine locks review only");
assert(OPERATOR_SANDBOX_DEMO_REVIEW_CAPTURE_DOCTRINE.boundary.sandboxOnly === true, "Doctrine locks sandbox only");
assert(OPERATOR_SANDBOX_DEMO_REVIEW_CAPTURE_DOCTRINE.boundary.notLaunchApproval === true, "Doctrine blocks launch approval");
assert(OPERATOR_SANDBOX_DEMO_REVIEW_CAPTURE_DOCTRINE.boundary.noLiveRailsCreated === true, "Doctrine creates no live rails");
assert(OPERATOR_SANDBOX_DEMO_REVIEW_CAPTURE_DOCTRINE.boundary.noLivePaymentProcessingCreated === true, "Doctrine creates no payment processing");
assert(OPERATOR_SANDBOX_DEMO_REVIEW_CAPTURE_DOCTRINE.boundary.noRuntimeActivationCreated === true, "Doctrine creates no runtime activation");

const script = buildOperatorSandboxDemoScript();

assert(script.openingBoundary.length >= 7, "Demo script has opening boundary");
assert(script.sections.length === 4, "Demo script has four sections");
assert(script.prohibitedLanguage.includes("This processes live payments."), "Demo script blocks live payment language");
assert(script.prohibitedLanguage.includes("PAI-SAFE verifies transaction truth."), "Demo script blocks PAI-SAFE truth claim");
assert(script.boundary.scriptCreatesNoLiveRails === true, "Demo script creates no live rails");
assert(script.boundary.scriptIsNotLaunchApproval === true, "Demo script is not launch approval");

const form = buildOperatorReviewCaptureForm();

assert(form.questions.length === 7, "Review capture form has seven questions");
assert(form.questions.some((question) => question.riskIfNo === "BLOCKING"), "Review capture form has blocking questions");
assert(form.requiredDecisionOptions.includes("READY_FOR_PRIVATE_REVIEW"), "Review form includes ready decision");
assert(form.requiredDecisionOptions.includes("NEEDS_BOUNDARY_REPAIR"), "Review form includes boundary repair decision");
assert(form.boundary.formIsReviewOnly === true, "Review form is review only");
assert(form.boundary.formIsNotLaunchApproval === true, "Review form is not launch approval");

const passingScore = scoreOperatorReviewCapture(form, buildPassingOperatorResponses());

assert(passingScore.score === 100, "Passing operator review score is 100");
assert(passingScore.blockingCount === 0, "Passing operator review has zero blocking findings");
assert(passingScore.recommendedDecision === "READY_FOR_PRIVATE_REVIEW", "Passing operator review recommends ready");
assert(passingScore.boundary.scoreCreatesNoLaunchAuthority === true, "Score creates no launch authority");

const failingScore = scoreOperatorReviewCapture(form, buildBoundaryFailingOperatorResponses());

assert(failingScore.score < 100, "Failing operator review score below 100");
assert(failingScore.blockingCount >= 1, "Failing operator review has blocking findings");
assert(failingScore.recommendedDecision === "NEEDS_BOUNDARY_REPAIR", "Failing operator review recommends boundary repair");

const packet = buildOperatorSandboxDemoReviewCapturePacket();

assert(packet.status === "OPERATOR_SANDBOX_DEMO_SCRIPT_REVIEW_CAPTURE_READY", "Operator sandbox demo review capture packet ready");
assert(packet.dependencyStatus === "PRIVATE_SANDBOX_REVIEW_DEMO_PREP_READY", "Packet dependency status ready");
assert(packet.sampleScore.recommendedDecision === "READY_FOR_PRIVATE_REVIEW", "Packet sample score ready");
assert(packet.refusalReasons.length === 0, "Packet has no refusal reasons");
assert(packet.boundary.packetIsReviewOnly === true, "Packet is review only");
assert(packet.boundary.packetIsNotLaunchApproval === true, "Packet is not launch approval");

const blockedPacket = buildOperatorSandboxDemoReviewCapturePacket("PRIVATE_SANDBOX_REVIEW_DEMO_PREP_REFUSED");

assert(blockedPacket.status === "OPERATOR_SANDBOX_DEMO_SCRIPT_REVIEW_CAPTURE_BLOCKED", "Dependency failure blocks packet");
assert(blockedPacket.refusalReasons.includes("PRIVATE_SANDBOX_REVIEW_DEMO_PREP_NOT_READY"), "Dependency refusal recorded");

const noLiveLeak =
  packet.boundary.packetCreatesNoLiveRails === true &&
  packet.boundary.packetCreatesNoPaymentProcessing === true &&
  packet.boundary.packetCreatesNoLiveTransactionTruth === true &&
  packet.boundary.packetCreatesNoLiveATS === true &&
  packet.boundary.packetCreatesNoCustodyTransfer === true &&
  packet.boundary.packetCreatesNoRuntimeActivation === true &&
  packet.boundary.packetIsNotLaunchApproval === true &&
  packet.boundary.packetCreatesNoLegalFinancialAuthorityClaims === true;

assert(noLiveLeak === true, "No live capability leaked from operator demo review capture");

console.log("");
console.log("OPERATOR_SANDBOX_DEMO_SCRIPT_REVIEW_CAPTURE_SMOKE=PASS");
