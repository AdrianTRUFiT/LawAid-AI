import {
  buildFundTrackerReverificationRequest,
  evaluateActivatedTransactionStateArtifactGate,
  bindGTISToPaiSafeDisplay,
  buildFinTechionOversightFeed,
  buildGTISDemoHarness
} from "../fundtracker-gtis-integration";
import type { GTISReviewPacketSummary } from "../fundtracker-gtis-integration";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const reviewPacket: GTISReviewPacketSummary = {
  status: "GTIS_LAUNCH_CANDIDATE_REVIEW_READY",
  finalLaunchCandidateStatus: "GTIS_TRANSACTION_TRUTH_GOVERNANCE_LAUNCH_CANDIDATE_READY",
  scopedCompile: "PASS",
  smoke: "PASS",
  launchRequiresHumanAcceptance: true
};

const cleanRequest = buildFundTrackerReverificationRequest({
  transactionRef: "txn_integration_001",
  verifiedOpportunityRef: "verified_opp_001",
  fundTrackerDecisionRef: "ft_decision_001",
  consequenceRoute: "FUNDTRACKER_REVERIFY_HANDOFF",
  reviewReceiptRef: "review_receipt_001",
  proofHealthClean: true,
  activeRefusals: [],
  gtisReviewPacket: reviewPacket,
  humanAcceptanceRecorded: true,
  attemptedWriteToFundTracker: false
});

assert(cleanRequest.status === "FUNDTRACKER_GTIS_INTEGRATION_REQUEST_READY", "Clean request ready");
assert(cleanRequest.readyToRequestFundTrackerReview === true, "Clean request ready for FundTrackerAI review");
assert(cleanRequest.route === "REQUEST_FUNDTRACKER_REVERIFICATION", "Clean request routes to FundTrackerAI reverification");
assert(cleanRequest.boundary.adapterIsReadAndRequestOnly === true, "Adapter is read-and-request only");
assert(cleanRequest.boundary.adapterDoesNotWriteFundTrackerState === true, "Adapter does not write FundTrackerAI state");
assert(cleanRequest.boundary.adapterIsNotTransactionTruth === true, "Adapter is not transaction truth");
assert(cleanRequest.boundary.fundTrackerAIRemainsTransactionTruth === true, "FundTrackerAI remains truth");

const illegalWrite = buildFundTrackerReverificationRequest({
  transactionRef: "txn_illegal_write",
  verifiedOpportunityRef: "verified_opp_write",
  fundTrackerDecisionRef: "ft_decision_write",
  consequenceRoute: "FUNDTRACKER_REVERIFY_HANDOFF",
  reviewReceiptRef: "review_receipt_write",
  proofHealthClean: true,
  activeRefusals: [],
  gtisReviewPacket: reviewPacket,
  humanAcceptanceRecorded: true,
  attemptedWriteToFundTracker: true
});

assert(illegalWrite.status === "FUNDTRACKER_GTIS_INTEGRATION_BLOCKED", "GTIS attempted write is blocked");
assert(illegalWrite.refusalReasons.includes("GTIS_CANNOT_WRITE_FUNDTRACKER_STATE"), "GTIS write refusal present");

const blockedNoHuman = buildFundTrackerReverificationRequest({
  transactionRef: "txn_blocked_human",
  verifiedOpportunityRef: "verified_opp_002",
  fundTrackerDecisionRef: "ft_decision_002",
  consequenceRoute: "FUNDTRACKER_REVERIFY_HANDOFF",
  reviewReceiptRef: "review_receipt_002",
  proofHealthClean: true,
  activeRefusals: [],
  gtisReviewPacket: reviewPacket,
  humanAcceptanceRecorded: false,
  attemptedWriteToFundTracker: false
});

assert(blockedNoHuman.status === "FUNDTRACKER_GTIS_INTEGRATION_BLOCKED", "Missing human acceptance blocks handoff");
assert(blockedNoHuman.refusalReasons.includes("HUMAN_ACCEPTANCE_REQUIRED"), "Human acceptance refusal present");

const processorOnly = buildFundTrackerReverificationRequest({
  transactionRef: "txn_processor_only",
  consequenceRoute: "HUMAN_REVIEW_REQUIRED",
  proofHealthClean: true,
  activeRefusals: [],
  gtisReviewPacket: reviewPacket,
  humanAcceptanceRecorded: true,
  attemptedWriteToFundTracker: false
});

assert(processorOnly.readyToRequestFundTrackerReview === false, "Processor-only / no references blocked");
assert(processorOnly.refusalReasons.includes("FUNDTRACKER_DECISION_REF_REQUIRED"), "FundTracker decision ref required");
assert(processorOnly.refusalReasons.includes("VERIFIED_OPPORTUNITY_REF_REQUIRED"), "Verified opportunity ref required");

const atsVerified = evaluateActivatedTransactionStateArtifactGate({
  transactionRef: "txn_integration_001",
  actor: "FUNDTRACKER_AI",
  verifiedCommitment: true,
  verifiedOpportunityRef: "verified_opp_001",
  fundTrackerDecisionRef: "ft_decision_001",
  fundTrackerEmittedActivatedTransactionStateRef: "ats_fundtracker_emitted_001",
  proofHealthClean: true,
  activeRefusals: []
});

assert(atsVerified.status === "ATS_ARTIFACT_VERIFIED", "ATS artifact verified when emitted by FundTrackerAI");
assert(atsVerified.eligible === true, "ATS artifact eligible true");
assert(atsVerified.activatedTransactionStateRef === "ats_fundtracker_emitted_001", "FundTrackerAI-emitted ATS ref preserved");
assert(atsVerified.boundary.gateVerifiesArtifactOnly === true, "ATS gate verifies artifact only");
assert(atsVerified.boundary.gateDoesNotGenerateActivatedTransactionState === true, "ATS gate does not generate ATS");
assert(atsVerified.boundary.gateDoesNotCreateRuntimeActivation === true, "ATS gate does not create runtime activation");

const atsBlockedByGTIS = evaluateActivatedTransactionStateArtifactGate({
  transactionRef: "txn_bad_actor",
  actor: "GTIS",
  verifiedCommitment: true,
  verifiedOpportunityRef: "verified_opp_003",
  fundTrackerDecisionRef: "ft_decision_003",
  fundTrackerEmittedActivatedTransactionStateRef: "ats_fake_gtis",
  proofHealthClean: true,
  activeRefusals: []
});

assert(atsBlockedByGTIS.status === "ATS_ARTIFACT_BLOCKED", "GTIS cannot emit ATS artifact");
assert(atsBlockedByGTIS.refusalReasons.includes("ATS_ARTIFACT_MUST_BE_EMITTED_BY_FUNDTRACKER"), "ATS must be emitted by FundTrackerAI");

const missingAts = evaluateActivatedTransactionStateArtifactGate({
  transactionRef: "txn_missing_ats",
  actor: "FUNDTRACKER_AI",
  verifiedCommitment: true,
  verifiedOpportunityRef: "verified_opp_missing",
  fundTrackerDecisionRef: "ft_decision_missing",
  proofHealthClean: true,
  activeRefusals: []
});

assert(missingAts.status === "ATS_ARTIFACT_BLOCKED", "Missing ATS artifact blocked");
assert(missingAts.refusalReasons.includes("ATS_ARTIFACT_REQUIRED"), "ATS artifact required");

const paiSafeBinding = bindGTISToPaiSafeDisplay(cleanRequest, atsVerified);

assert(paiSafeBinding.status === "display_governed_safe", "PAI-SAFE displays governed safe for FundTrackerAI reverify request");
assert(paiSafeBinding.safeToDisplay === true, "PAI-SAFE safe to display");
assert(paiSafeBinding.boundary.paiSafeDoesNotCreateTransactionTruth === true, "PAI-SAFE does not create truth");
assert(paiSafeBinding.boundary.paiSafeDoesNotCreateRuntimeActivation === true, "PAI-SAFE does not create runtime activation");
assert(paiSafeBinding.boundary.displayIsNotAuthority === true, "Display is not authority");

const atsRequest = buildFundTrackerReverificationRequest({
  transactionRef: "txn_ats_request",
  verifiedOpportunityRef: "verified_opp_ats",
  fundTrackerDecisionRef: "ft_decision_ats",
  consequenceRoute: "ACTIVATION_ELIGIBILITY_READY",
  reviewReceiptRef: "review_receipt_ats",
  proofHealthClean: true,
  activeRefusals: [],
  gtisReviewPacket: reviewPacket,
  humanAcceptanceRecorded: true,
  attemptedWriteToFundTracker: false
});

const atsPaiSafe = bindGTISToPaiSafeDisplay(atsRequest, atsVerified);

assert(atsPaiSafe.status === "display_activated", "PAI-SAFE can display activated from verified FundTrackerAI ATS artifact");
assert(atsPaiSafe.downstreamActivationEligible === true, "Downstream activation eligible display true");
assert(atsPaiSafe.boundary.paiSafeDoesNotCreateRuntimeActivation === true, "Activated display still creates no runtime activation");

const oversight = buildFinTechionOversightFeed(cleanRequest, atsVerified, paiSafeBinding);

assert(oversight.boundary.oversightIsReadOnly === true, "FinTechionAI feed read-only");
assert(oversight.boundary.oversightDoesNotOverrideFundTrackerAI === true, "FinTechionAI does not override FundTrackerAI");
assert(oversight.boundary.oversightDoesNotCreateActivatedTransactionState === true, "FinTechionAI does not create ATS");
assert(oversight.boundary.oversightDoesNotAuthorizeConsequence === true, "FinTechionAI does not authorize consequence");

const blockedOversight = buildFinTechionOversightFeed(processorOnly, atsBlockedByGTIS, bindGTISToPaiSafeDisplay(processorOnly, atsBlockedByGTIS));

assert(blockedOversight.route === "respond", "Blocked handoff routes oversight to respond");
assert(blockedOversight.signals.length > 0, "Blocked oversight contains signals");

const harness = buildGTISDemoHarness();

assert(harness.scenariosFailed === 0, "Demo harness has zero failed scenarios");
assert(harness.scenariosPassed === 7, "Demo harness passes seven scenarios");
assert(harness.boundary.demoCreatesNoPaymentAuthority === true, "Demo creates no payment authority");
assert(harness.boundary.demoCreatesNoTransactionTruth === true, "Demo creates no transaction truth");
assert(harness.boundary.demoCreatesNoRuntimeActivation === true, "Demo creates no runtime activation");
assert(harness.boundary.everyDemoClaimMustTraceToArtifact === true, "Every demo claim must trace to artifact");

console.log("");
console.log("FUNDTRACKER_GTIS_INTEGRATION_RUN_1_REVISED_SMOKE=PASS");
