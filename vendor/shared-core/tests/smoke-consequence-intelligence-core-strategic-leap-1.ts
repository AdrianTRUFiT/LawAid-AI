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
  queueHumanReviewItem,
  resolveHumanReview
} from "../human-review-queue";
import {
  CONSEQUENCE_INTELLIGENCE_DOCTRINE,
  evaluateConsequenceIntelligence
} from "../consequence-intelligence-core";
import type {
  ConsequenceIntelligenceInput,
  ConsequenceProofHealth,
  ConsequenceTimingWindow
} from "../consequence-intelligence-core";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

function baseObservation(vector: FraudAttackObservation["vector"], seed = "obs"): FraudAttackObservation {
  return {
    observationId: `${seed}_${vector}`,
    vector,
    detected: true,
    refused: true,
    attemptedAt: "2026-04-28T13:00:00.000Z",
    targetProjectionId: "projection_leap1_001",
    targetAnchorId: "anchor_leap1_001",
    actorFingerprint: "actor_leap1",
    sessionFingerprint: "session_leap1",
    mutationFamily: "leap1"
  };
}

const processorEvent: ProcessorEventSnapshot = {
  processorEventRef: "processor_leap1_001",
  processorStatus: "succeeded",
  processorEventIsAuthority: false
};

function fundTrackerState(overrides: Partial<FundTrackerVerifiedState>): FundTrackerVerifiedState {
  return {
    transactionRef: "txn_leap1_001",
    fundTrackerDecisionRef: "ft_leap1_001",
    decisionKind: "REFUSED",
    verifiedCommitment: false,
    refusalReason: "machine refusal before review",
    createdAt: "2026-04-28T13:00:00.000Z",
    boundary: {
      fundTrackerIsTruthSource: true,
      processorEventIsAuthority: false,
      paymentMovementIsVerifiedCommitment: false,
      checkoutSuccessIsActivationAuthority: false
    },
    ...overrides
  };
}

const cleanProof: ConsequenceProofHealth = {
  ledgerChainVerified: true,
  registryReceiptVerified: true,
  fileLedgerVerified: true,
  fraudResistanceReportFresh: true,
  publicPrivateSeparationVerified: true
};

const cleanTiming: ConsequenceTimingWindow = {
  evaluatedAt: "2026-04-28T13:00:02.000Z",
  sourceEventAt: "2026-04-28T13:00:00.000Z",
  maxAllowedSkewMs: 300000,
  actualSkewMs: 2000,
  verificationWindowId: "window_001"
};

async function main() {
  assert(CONSEQUENCE_INTELLIGENCE_DOCTRINE.boundary.fundTrackerAIRemainsTransactionTruth === true, "FundTrackerAI remains transaction truth");
  assert(CONSEQUENCE_INTELLIGENCE_DOCTRINE.boundary.consequenceIntelligenceIsNotPaymentAuthority === true, "Consequence intelligence is not payment authority");
  assert(CONSEQUENCE_INTELLIGENCE_DOCTRINE.boundary.movingTargetChallengeIsNotAuthority === true, "Moving target challenge is not authority");

  const criticalObservation = baseObservation("BOUNDARY_DOWNGRADE", "critical");
  const criticalMemory = buildFraudAttackPatternMemory([criticalObservation]);
  const criticalFraud = evaluateFraudPressureObservation(criticalObservation, criticalMemory);

  const refusedPaiSafe = buildPaiSafeSurfaceState(
    processorEvent,
    fundTrackerState({
      decisionKind: "REFUSED",
      verifiedCommitment: false,
      refusalReason: "boundary downgrade"
    })
  );

  const queued = queueHumanReviewItem(criticalFraud, refusedPaiSafe.surfaceState);

  assert(queued.queued === true, "Critical fraud pressure enters human review queue");

  if (!queued.item) throw new Error("QUEUE_ITEM_REQUIRED");

  const releaseResolution = resolveHumanReview({
    reviewItem: queued.item,
    reviewerId: "security_leap1",
    reviewerAuthority: "AUTHORIZED_SECURITY_REVIEWER",
    decision: "AUTHORIZE_RELEASE_TO_FUNDTRACKER",
    resolutionNotes: "handoff only, FundTrackerAI must reverify",
    resolvedAt: "2026-04-28T13:03:00.000Z"
  });

  assert(releaseResolution.accepted === true, "Authorized release handoff receipt accepted");
  assert(releaseResolution.receipt?.nextAllowedTarget === "FUNDTRACKER_REVIEW_HANDOFF", "Review receipt targets FundTrackerAI handoff only");

  if (!releaseResolution.receipt) throw new Error("REVIEW_RECEIPT_REQUIRED");

  const cleanObservation = baseObservation("ANCHOR_HASH_MUTATION", "clean");
  const cleanMemory = buildFraudAttackPatternMemory([cleanObservation]);
  const cleanFraud = {
    ...evaluateFraudPressureObservation(cleanObservation, cleanMemory),
    severity: "LOW" as const,
    route: "MACHINE_REFUSE" as const,
    reviewRequired: false,
    score: {
      transactionIntegrityScore: 5,
      artifactIntegrityScore: 5,
      registryIntegrityScore: 5,
      boundaryIntegrityScore: 5,
      repetitionPressureScore: 0,
      authorityConfusionScore: 5,
      publicPrivateLeakScore: 0,
      aggregateScore: 5
    }
  };

  const safePaiSafe = buildPaiSafeSurfaceState(
    processorEvent,
    fundTrackerState({
      decisionKind: "VERIFIED_COMMITMENT",
      verifiedCommitment: true,
      fundTrackerDecisionRef: "ft_verified_leap1_001"
    })
  );

  const cleanInput: ConsequenceIntelligenceInput = {
    transactionRef: "txn_leap1_001",
    fundTrackerDecisionRef: "ft_verified_leap1_001",
    paiSafeSurfaceState: safePaiSafe.surfaceState,
    fraudPressureDecision: cleanFraud,
    reviewReceipt: releaseResolution.receipt,
    proofHealth: cleanProof,
    timingWindow: cleanTiming,
    replayPressureCount: 0,
    driftSignals: [],
    syntheticAuthorityClaimed: false
  };

  const handoff = await evaluateConsequenceIntelligence(cleanInput);

  assert(handoff.status === "CONSEQUENCE_INTELLIGENCE_HANDOFF_READY", "Clean reviewed transaction becomes FundTrackerAI re-verification handoff ready");
  assert(handoff.route === "FUNDTRACKER_REVERIFY_HANDOFF", "Clean reviewed transaction routes to FundTrackerAI re-verification handoff");
  assert(handoff.consequenceEligible === true, "Clean reviewed transaction is consequence eligible for handoff");
  assert(handoff.fundTrackerReverificationRequired === true, "FundTrackerAI re-verification remains required");
  assert(handoff.boundary.decisionIsNotPaymentAuthority === true, "Decision is not payment authority");
  assert(handoff.boundary.decisionIsNotTransactionTruth === true, "Decision is not transaction truth");
  assert(handoff.boundary.decisionIsNotRuntimeActivation === true, "Decision is not runtime activation");
  assert(handoff.challenge.boundary.movingTargetPreventsStaticReplay === true, "Moving target challenge exists");

  const sameAgain = await evaluateConsequenceIntelligence(cleanInput);
  assert(handoff.challenge.challengeHash === sameAgain.challenge.challengeHash, "Same verification window produces deterministic challenge hash");

  const changedWindow = await evaluateConsequenceIntelligence({
    ...cleanInput,
    timingWindow: {
      ...cleanTiming,
      verificationWindowId: "window_002"
    }
  });

  assert(handoff.challenge.challengeHash !== changedWindow.challenge.challengeHash, "New verification window changes challenge hash");

  const criticalBlock = await evaluateConsequenceIntelligence({
    ...cleanInput,
    fraudPressureDecision: criticalFraud
  });

  assert(criticalBlock.route === "HUMAN_REVIEW_REQUIRED", "Active critical fraud pressure blocks handoff");
  assert(criticalBlock.refusalReasons.includes("CRITICAL_FRAUD_PRESSURE_ACTIVE"), "Critical fraud pressure refusal present");

  const replayBlock = await evaluateConsequenceIntelligence({
    ...cleanInput,
    replayPressureCount: 1
  });

  assert(replayBlock.route === "CONTINUE_HOLD", "Replay pressure holds consequence");
  assert(replayBlock.refusalReasons.includes("REPLAY_PRESSURE_ACTIVE"), "Replay pressure refusal present");

  const proofBlock = await evaluateConsequenceIntelligence({
    ...cleanInput,
    proofHealth: {
      ...cleanProof,
      ledgerChainVerified: false
    }
  });

  assert(proofBlock.route === "CONTINUE_HOLD", "Unverified ledger chain holds consequence");
  assert(proofBlock.refusalReasons.includes("LEDGER_CHAIN_NOT_VERIFIED"), "Ledger chain refusal present");

  const staleBlock = await evaluateConsequenceIntelligence({
    ...cleanInput,
    timingWindow: {
      ...cleanTiming,
      actualSkewMs: 600000
    }
  });

  assert(staleBlock.route === "HUMAN_REVIEW_REQUIRED", "Expired verification window requires review");
  assert(staleBlock.refusalReasons.includes("TIME_WINDOW_EXPIRED"), "Time window refusal present");

  const driftBlock = await evaluateConsequenceIntelligence({
    ...cleanInput,
    driftSignals: [
      {
        signalId: "drift_001",
        label: "surface truth drift",
        active: true,
        severity: "HIGH"
      }
    ]
  });

  assert(driftBlock.route === "HUMAN_REVIEW_REQUIRED", "Active drift signal requires review");
  assert(driftBlock.refusalReasons.includes("DRIFT_SIGNAL_ACTIVE"), "Drift signal refusal present");

  const syntheticBlock = await evaluateConsequenceIntelligence({
    ...cleanInput,
    syntheticAuthorityClaimed: true
  });

  assert(syntheticBlock.route === "INSTANT_REFUSE", "Synthetic authority claim instantly refused");
  assert(syntheticBlock.refusalReasons.includes("SYNTHETIC_AUTHORITY_ATTEMPT_REFUSED"), "Synthetic authority refusal present");

  const activatedPaiSafe = buildPaiSafeSurfaceState(
    processorEvent,
    fundTrackerState({
      decisionKind: "ACTIVATED_TRANSACTION_STATE",
      verifiedCommitment: true,
      fundTrackerDecisionRef: "ft_activated_leap1_001",
      activatedTransactionStateRef: "ats_leap1_001"
    })
  );

  const activationEligible = await evaluateConsequenceIntelligence({
    ...cleanInput,
    fundTrackerDecisionRef: "ft_activated_leap1_001",
    activatedTransactionStateRef: "ats_leap1_001",
    paiSafeSurfaceState: activatedPaiSafe.surfaceState
  });

  assert(activationEligible.route === "ACTIVATION_ELIGIBILITY_READY", "Activated state can pass activation eligibility precheck");
  assert(activationEligible.activationEligibilityPrecheckPassed === true, "Activation eligibility precheck passed");
  assert(activationEligible.boundary.decisionIsNotRuntimeActivation === true, "Activation eligibility is not runtime activation");
  assert(activationEligible.boundary.fundTrackerMustStillAuthorizeConsequence === true, "FundTrackerAI still authorizes consequence");

  console.log("");
  console.log("CONSEQUENCE_INTELLIGENCE_CORE_STRATEGIC_LEAP_1_SMOKE=PASS");
}

main().catch((error) => {
  throw error;
});
