import {
  CANONICAL_PAYMENT_LAW,
  PAI_SAFE_SURFACE_DOCTRINE,
  buildPaiSafeSurfaceState
} from "../pai-safe-surface";
import type {
  FundTrackerVerifiedState,
  ProcessorEventSnapshot
} from "../pai-safe-surface";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const processorSuccess: ProcessorEventSnapshot = {
  processorEventRef: "processor_evt_001",
  processorStatus: "succeeded",
  processorEventIsAuthority: false
};

const noProcessor: ProcessorEventSnapshot = {
  processorStatus: "none",
  processorEventIsAuthority: false
};

function fundTrackerState(
  overrides: Partial<FundTrackerVerifiedState>
): FundTrackerVerifiedState {
  return {
    transactionRef: "txn_stage8a_001",
    fundTrackerDecisionRef: "ft_decision_001",
    decisionKind: "NO_DECISION",
    verifiedCommitment: false,
    createdAt: "2026-04-28T00:00:00.000Z",
    boundary: {
      fundTrackerIsTruthSource: true,
      processorEventIsAuthority: false,
      paymentMovementIsVerifiedCommitment: false,
      checkoutSuccessIsActivationAuthority: false
    },
    ...overrides
  };
}

assert(PAI_SAFE_SURFACE_DOCTRINE.class === "BRANDED_CONSUMER_FACING_SURFACE", "PAI-SAFE classified as branded consumer-facing surface");
assert(PAI_SAFE_SURFACE_DOCTRINE.authority === "NONE", "PAI-SAFE authority is none");
assert(PAI_SAFE_SURFACE_DOCTRINE.boundary.paiSafeIsNotTransactionTruthEngine === true, "PAI-SAFE is not transaction truth engine");
assert(PAI_SAFE_SURFACE_DOCTRINE.boundary.fundTrackerAIRemainsTransactGovernorInsideRATE === true, "FundTrackerAI remains Transact governor");
assert(PAI_SAFE_SURFACE_DOCTRINE.boundary.finTechionAIConsumesAndInterpretsButDoesNotCommandTransactionTruth === true, "FinTechionAI consumes but does not command truth");

assert(CANONICAL_PAYMENT_LAW.processorEventIsNotTransactionTruth === true, "Processor event is not transaction truth");
assert(CANONICAL_PAYMENT_LAW.paymentMovementIsNotVerifiedCommitment === true, "Payment movement is not verified commitment");
assert(CANONICAL_PAYMENT_LAW.checkoutSuccessIsNotActivationAuthority === true, "Checkout success is not activation authority");

const processorOnly = buildPaiSafeSurfaceState(
  processorSuccess,
  fundTrackerState({
    decisionKind: "PROCESSOR_EVENT_ONLY",
    fundTrackerDecisionRef: undefined
  })
);

assert(processorOnly.surfaceState.status === "requires_attention", "Processor success alone does not produce governed_safe");
assert(processorOnly.surfaceState.safeToProceed === false, "Processor-only state is not safe to proceed");
assert(processorOnly.surfaceState.downstreamActivationEligible === false, "Processor-only state is not downstream eligible");
assert(processorOnly.surfaceState.processorEventIsAuthority === false, "Processor event authority remains false");
assert(processorOnly.surfaceState.fundTrackerIsTruthSource === true, "FundTrackerAI remains truth source");

const verified = buildPaiSafeSurfaceState(
  noProcessor,
  fundTrackerState({
    decisionKind: "VERIFIED_COMMITMENT",
    verifiedCommitment: true,
    fundTrackerDecisionRef: "ft_verified_001"
  })
);

assert(verified.surfaceState.status === "governed_safe", "Verified commitment produces governed_safe");
assert(verified.surfaceState.safeToProceed === true, "Governed safe is safe to proceed");
assert(verified.surfaceState.downstreamActivationEligible === false, "Governed safe without ATS is not downstream activation eligible");
assert(verified.surfaceState.fundTrackerDecisionRef === "ft_verified_001", "FundTrackerAI decision ref preserved");

const held = buildPaiSafeSurfaceState(
  noProcessor,
  fundTrackerState({
    decisionKind: "HELD_FOR_REVIEW",
    reviewReason: "risk threshold exceeded",
    fundTrackerDecisionRef: "ft_hold_001"
  })
);

assert(held.surfaceState.status === "held_for_review", "Held decision produces held_for_review");
assert(held.surfaceState.safeToProceed === false, "Held state not safe to proceed");
assert(held.oversightProjection.operatorActionSuggested === "review", "Held state routes FinTechionAI oversight to review");
assert(held.oversightProjection.boundary.oversightIsNotTransactionTruth === true, "FinTechionAI oversight is not transaction truth");

const refused = buildPaiSafeSurfaceState(
  noProcessor,
  fundTrackerState({
    decisionKind: "REFUSED",
    refusalReason: "commitment verification failed",
    fundTrackerDecisionRef: "ft_refused_001"
  })
);

assert(refused.surfaceState.status === "refused", "Refused decision produces refused");
assert(refused.surfaceState.safeToProceed === false, "Refused state not safe to proceed");
assert(refused.oversightProjection.operatorActionSuggested === "respond", "Refused state routes FinTechionAI oversight to respond");

const activated = buildPaiSafeSurfaceState(
  noProcessor,
  fundTrackerState({
    decisionKind: "ACTIVATED_TRANSACTION_STATE",
    verifiedCommitment: true,
    fundTrackerDecisionRef: "ft_activated_001",
    activatedTransactionStateRef: "ats_001"
  })
);

assert(activated.surfaceState.status === "activated", "Activated Transaction State produces activated");
assert(activated.surfaceState.safeToProceed === true, "Activated state safe to proceed");
assert(activated.surfaceState.downstreamActivationEligible === true, "Activated state downstream eligible");
assert(activated.surfaceState.activatedTransactionStateRef === "ats_001", "Activated Transaction State ref preserved");
assert(activated.oversightProjection.activatedTransactionStateRef === "ats_001", "ATS ref preserved for oversight visibility");

const pending = buildPaiSafeSurfaceState(
  noProcessor,
  fundTrackerState({
    decisionKind: "VERIFICATION_PENDING",
    fundTrackerDecisionRef: "ft_pending_001"
  })
);

assert(pending.surfaceState.status === "verification_pending", "Pending state produces verification_pending");
assert(pending.surfaceState.safeToProceed === false, "Pending state is not safe to proceed");

const states = [processorOnly, verified, held, refused, activated, pending];

const everySurfacePreservesBoundary = states.every((result) =>
  result.surfaceState.authority === "DISPLAY_ONLY" &&
  result.surfaceState.paiSafeCreatesTransactionTruth === false &&
  result.surfaceState.paiSafeCreatesCommitmentVerification === false &&
  result.surfaceState.paiSafeCreatesEntitlement === false &&
  result.surfaceState.paiSafeCreatesActivation === false &&
  result.surfaceState.paiSafeOverridesFundTrackerAI === false &&
  result.surfaceState.finTechionAICreatesTransactionTruth === false &&
  result.surfaceState.finTechionAIOverridesFundTrackerAI === false &&
  result.surfaceState.boundary.paiSafeIsBrandedSurfaceOnly === true &&
  result.surfaceState.boundary.fundTrackerAIRemainsTransactionTruth === true &&
  result.surfaceState.boundary.finTechionAIRemainsOperatorOversight === true
);

assert(everySurfacePreservesBoundary === true, "Every PAI-SAFE surface state preserves non-authority boundaries");

const everyOversightPreservesBoundary = states.every((result) =>
  result.oversightProjection.boundary.oversightIsNotTransactionTruth === true &&
  result.oversightProjection.boundary.oversightDoesNotOverrideFundTrackerAI === true &&
  result.oversightProjection.boundary.oversightDoesNotCreateActivation === true &&
  result.oversightProjection.boundary.oversightDoesNotCreatePaymentAuthority === true
);

assert(everyOversightPreservesBoundary === true, "Every FinTechionAI oversight projection preserves non-authority boundaries");

console.log("");
console.log("PAI_SAFE_SURFACE_CONTRACT_STAGE_8A_SMOKE=PASS");

