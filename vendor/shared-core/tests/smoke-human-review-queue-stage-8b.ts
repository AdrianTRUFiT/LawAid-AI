import {
  buildFraudAttackPatternMemory,
  evaluateFraudPressureObservation
} from "../adaptive-fraud-pressure-matrix";
import type { FraudAttackObservation } from "../adaptive-fraud-pressure-matrix";
import {
  buildPaiSafeSurfaceState
} from "../pai-safe-surface";
import type {
  FundTrackerVerifiedState,
  ProcessorEventSnapshot
} from "../pai-safe-surface";
import {
  HUMAN_REVIEW_QUEUE_DOCTRINE,
  queueHumanReviewItem,
  resolveHumanReview
} from "../human-review-queue";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const observation: FraudAttackObservation = {
  observationId: "obs_stage8b_001",
  vector: "BOUNDARY_DOWNGRADE",
  detected: true,
  refused: true,
  attemptedAt: "2026-04-28T12:00:00.000Z",
  targetProjectionId: "projection_stage8b_001",
  targetAnchorId: "anchor_stage8b_001",
  actorFingerprint: "actor_stage8b",
  sessionFingerprint: "session_stage8b",
  mutationFamily: "boundary"
};

const patternMemory = buildFraudAttackPatternMemory([observation]);
const fraudDecision = evaluateFraudPressureObservation(observation, patternMemory);

const processorEvent: ProcessorEventSnapshot = {
  processorEventRef: "processor_stage8b_001",
  processorStatus: "succeeded",
  processorEventIsAuthority: false
};

const fundTrackerState: FundTrackerVerifiedState = {
  transactionRef: "txn_stage8b_001",
  fundTrackerDecisionRef: "ft_stage8b_refused_001",
  decisionKind: "REFUSED",
  verifiedCommitment: false,
  refusalReason: "boundary downgrade attempt",
  createdAt: "2026-04-28T12:00:01.000Z",
  boundary: {
    fundTrackerIsTruthSource: true,
    processorEventIsAuthority: false,
    paymentMovementIsVerifiedCommitment: false,
    checkoutSuccessIsActivationAuthority: false
  }
};

const paiSafe = buildPaiSafeSurfaceState(processorEvent, fundTrackerState);

assert(HUMAN_REVIEW_QUEUE_DOCTRINE.boundary.machineCanRefuse === true, "Machine can refuse");
assert(HUMAN_REVIEW_QUEUE_DOCTRINE.boundary.machineCannotAuthorizeConsequence === true, "Machine cannot authorize consequence");
assert(HUMAN_REVIEW_QUEUE_DOCTRINE.boundary.humanAuthorizationRequiredForConsequence === true, "Human authorization required for consequence");

assert(fraudDecision.severity === "CRITICAL", "Fraud pressure decision is critical");
assert(fraudDecision.route === "CRITICAL_ESCALATION", "Fraud pressure routes to critical escalation");
assert(fraudDecision.machineRefused === true, "Fraud pressure machine refusal is true");
assert(fraudDecision.humanAuthorizationRequiredForConsequence === true, "Fraud pressure requires human authorization");

assert(paiSafe.surfaceState.status === "refused", "PAI-SAFE shows refused state");
assert(paiSafe.surfaceState.paiSafeCreatesTransactionTruth === false, "PAI-SAFE creates no transaction truth");

const queued = queueHumanReviewItem(fraudDecision, paiSafe.surfaceState);

assert(queued.status === "REVIEW_ITEM_QUEUED", "Critical fraud pressure queues human review");
assert(queued.queued === true, "Human review queued true");
assert(queued.item !== undefined, "Human review item exists");
assert(queued.item?.evidencePacket.machineRefused === true, "Evidence packet preserves machine refusal");
assert(queued.item?.evidencePacket.humanAuthorizationRequiredForConsequence === true, "Evidence packet requires human authorization");
assert(queued.item?.boundary.machineRefusalBridgedToHumanCustody === true, "Machine refusal bridged to human custody");
assert(queued.boundary.machineCannotAuthorizeConsequence === true, "Queue blocks machine-only consequence");

if (!queued.item) throw new Error("QUEUED_ITEM_MISSING_AFTER_ASSERT");

const unauthorizedResolution = resolveHumanReview({
  reviewItem: queued.item,
  reviewerId: "unknown",
  reviewerAuthority: "UNAUTHORIZED",
  decision: "AUTHORIZE_RELEASE_TO_FUNDTRACKER",
  resolutionNotes: "attempted unauthorized release",
  resolvedAt: "2026-04-28T12:05:00.000Z"
});

assert(unauthorizedResolution.status === "RESOLUTION_REFUSED", "Unauthorized reviewer cannot resolve");
assert(unauthorizedResolution.accepted === false, "Unauthorized resolution accepted false");
assert(unauthorizedResolution.refusalReasons.includes("REVIEWER_NOT_AUTHORIZED"), "Unauthorized reviewer refusal present");

const authorizedHold = resolveHumanReview({
  reviewItem: queued.item,
  reviewerId: "operator_001",
  reviewerAuthority: "AUTHORIZED_OPERATOR",
  decision: "CONTINUE_HOLD",
  resolutionNotes: "continue hold pending additional verification",
  resolvedAt: "2026-04-28T12:06:00.000Z"
});

assert(authorizedHold.status === "RESOLUTION_ACCEPTED", "Authorized hold resolution accepted");
assert(authorizedHold.accepted === true, "Authorized hold accepted true");
assert(authorizedHold.receipt !== undefined, "Authorized hold receipt exists");
assert(authorizedHold.receipt?.nextAllowedTarget === "CONTINUE_HOLD", "Hold receipt target is continue hold");
assert(authorizedHold.receipt?.boundary.receiptIsNotPaymentAuthority === true, "Review receipt is not payment authority");
assert(authorizedHold.receipt?.boundary.receiptIsNotTransactionTruth === true, "Review receipt is not transaction truth");
assert(authorizedHold.receipt?.boundary.receiptIsNotRuntimeActivation === true, "Review receipt is not runtime activation");

const authorizedReleaseHandoff = resolveHumanReview({
  reviewItem: queued.item,
  reviewerId: "security_001",
  reviewerAuthority: "AUTHORIZED_SECURITY_REVIEWER",
  decision: "AUTHORIZE_RELEASE_TO_FUNDTRACKER",
  resolutionNotes: "authorized handoff to FundTrackerAI only",
  resolvedAt: "2026-04-28T12:07:00.000Z"
});

assert(authorizedReleaseHandoff.status === "RESOLUTION_ACCEPTED", "Authorized release handoff accepted");
assert(authorizedReleaseHandoff.receipt?.nextAllowedTarget === "FUNDTRACKER_REVIEW_HANDOFF", "Release target is FundTrackerAI handoff");
assert(
  authorizedReleaseHandoff.receipt?.boundary.fundTrackerMustStillAuthorizeConsequence === true,
  "FundTrackerAI must still authorize consequence"
);
assert(
  authorizedReleaseHandoff.boundary.releaseDoesNotBypassFundTrackerAI === true,
  "Release does not bypass FundTrackerAI"
);
assert(
  authorizedReleaseHandoff.boundary.resolutionDoesNotCreatePaymentAuthority === true,
  "Resolution creates no payment authority"
);
assert(
  authorizedReleaseHandoff.boundary.resolutionDoesNotCreateTransactionTruth === true,
  "Resolution creates no transaction truth"
);
assert(
  authorizedReleaseHandoff.boundary.resolutionDoesNotCreateRuntimeActivation === true,
  "Resolution creates no runtime activation"
);

const lowRouteObservation: FraudAttackObservation = {
  ...observation,
  observationId: "obs_stage8b_low_001",
  vector: "ANCHOR_HASH_MUTATION"
};

const lowPattern = buildFraudAttackPatternMemory([lowRouteObservation]);
const lowerDecision = evaluateFraudPressureObservation(lowRouteObservation, lowPattern);

const refusedQueue = queueHumanReviewItem(
  {
    ...lowerDecision,
    route: "MACHINE_REFUSE",
    reviewRequired: false
  },
  paiSafe.surfaceState
);

assert(refusedQueue.status === "REVIEW_ITEM_REFUSED", "Non-review route refused by queue");
assert(refusedQueue.refusalReasons.includes("HUMAN_REVIEW_ROUTE_REQUIRED"), "Human review route required refusal present");

console.log("");
console.log("HUMAN_REVIEW_QUEUE_STAGE_8B_SMOKE=PASS");
