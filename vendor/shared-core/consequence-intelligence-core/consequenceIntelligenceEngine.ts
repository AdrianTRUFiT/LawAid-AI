import { canonicalize, sha256Hex } from "../projection-ledger";
import type {
  ConsequenceIntelligenceDecision,
  ConsequenceIntelligenceInput,
  ConsequenceRefusalCode,
  ConsequenceRoute,
  ConsequenceScoreBreakdown,
  ConsequenceStatus,
  MovingTargetChallenge
} from "./consequenceIntelligenceContracts";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function hasText(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function proofIntegrityScore(input: ConsequenceIntelligenceInput): number {
  const checks = [
    input.proofHealth.ledgerChainVerified,
    input.proofHealth.registryReceiptVerified,
    input.proofHealth.fileLedgerVerified,
    input.proofHealth.fraudResistanceReportFresh,
    input.proofHealth.publicPrivateSeparationVerified
  ];

  return clampScore((checks.filter(Boolean).length / checks.length) * 100);
}

function authorityIntegrityScore(input: ConsequenceIntelligenceInput): number {
  let score = 100;

  if (input.syntheticAuthorityClaimed) score -= 70;
  if (input.paiSafeSurfaceState.authority !== "DISPLAY_ONLY") score -= 60;
  if (input.paiSafeSurfaceState.paiSafeCreatesTransactionTruth !== false) score -= 100;
  if (input.paiSafeSurfaceState.paiSafeOverridesFundTrackerAI !== false) score -= 100;
  if (!hasText(input.fundTrackerDecisionRef)) score -= 50;
  if (!input.reviewReceipt) score -= 35;
  if (input.reviewReceipt && input.reviewReceipt.boundary.fundTrackerMustStillAuthorizeConsequence !== true) score -= 60;

  return clampScore(score);
}

function fraudPressureScore(input: ConsequenceIntelligenceInput): number {
  const aggregate = input.fraudPressureDecision.score.aggregateScore;
  const severityPenalty =
    input.fraudPressureDecision.severity === "CRITICAL"
      ? 50
      : input.fraudPressureDecision.severity === "HIGH"
        ? 32
        : input.fraudPressureDecision.severity === "MEDIUM"
          ? 18
          : 8;

  return clampScore(100 - Math.max(aggregate * 0.45, severityPenalty));
}

function timeFreshnessScore(input: ConsequenceIntelligenceInput): number {
  if (input.timingWindow.actualSkewMs <= input.timingWindow.maxAllowedSkewMs) return 100;

  const overage = input.timingWindow.actualSkewMs - input.timingWindow.maxAllowedSkewMs;
  const penalty = Math.min(100, Math.ceil(overage / 1000));

  return clampScore(100 - penalty);
}

function driftResistanceScore(input: ConsequenceIntelligenceInput): number {
  const activeSignals = input.driftSignals.filter((signal) => signal.active);
  if (activeSignals.length === 0) return 100;

  const penalty = activeSignals.reduce((sum, signal) => {
    if (signal.severity === "CRITICAL") return sum + 60;
    if (signal.severity === "HIGH") return sum + 40;
    if (signal.severity === "MEDIUM") return sum + 24;
    return sum + 10;
  }, 0);

  return clampScore(100 - penalty);
}

function replayResistanceScore(input: ConsequenceIntelligenceInput): number {
  return clampScore(100 - input.replayPressureCount * 35);
}

function scoreConsequence(input: ConsequenceIntelligenceInput): ConsequenceScoreBreakdown {
  const proof = proofIntegrityScore(input);
  const authority = authorityIntegrityScore(input);
  const fraud = fraudPressureScore(input);
  const time = timeFreshnessScore(input);
  const drift = driftResistanceScore(input);
  const replay = replayResistanceScore(input);

  const aggregateScore = clampScore(
    proof * 0.22 +
      authority * 0.22 +
      fraud * 0.18 +
      time * 0.12 +
      drift * 0.14 +
      replay * 0.12
  );

  return {
    proofIntegrityScore: proof,
    authorityIntegrityScore: authority,
    fraudPressureScore: fraud,
    timeFreshnessScore: time,
    driftResistanceScore: drift,
    replayResistanceScore: replay,
    aggregateScore
  };
}

async function buildMovingTargetChallenge(input: ConsequenceIntelligenceInput): Promise<MovingTargetChallenge> {
  const reviewReceiptId = input.reviewReceipt?.receiptId ?? "NO_REVIEW_RECEIPT";

  const derivedFrom = {
    transactionRef: input.transactionRef,
    fundTrackerDecisionRef: input.fundTrackerDecisionRef,
    paiSafeId: input.paiSafeSurfaceState.paiSafeId,
    fraudObservationId: input.fraudPressureDecision.observationId,
    reviewReceiptId,
    verificationWindowId: input.timingWindow.verificationWindowId
  };

  const challengeHash = await sha256Hex(canonicalize(derivedFrom));

  return {
    challengeId: `challenge_${input.transactionRef}_${input.timingWindow.verificationWindowId}`,
    transactionRef: input.transactionRef,
    verificationWindowId: input.timingWindow.verificationWindowId,
    challengeHash,
    derivedFrom,
    boundary: {
      challengeIsNotPaymentAuthority: true,
      challengeIsNotTransactionTruth: true,
      challengeIsNotCustodyTransfer: true,
      challengeIsNotRuntimeActivation: true,
      movingTargetPreventsStaticReplay: true
    }
  };
}

function collectRefusals(input: ConsequenceIntelligenceInput): {
  refusalReasons: ConsequenceRefusalCode[];
  requiredCorrections: string[];
} {
  const refusalReasons: ConsequenceRefusalCode[] = [];
  const requiredCorrections: string[] = [];

  if (!input.reviewReceipt) {
    refusalReasons.push("FUNDTRACKER_REVIEW_RECEIPT_REQUIRED");
    requiredCorrections.push("Provide authorized review receipt before consequence handoff.");
  }

  if (input.reviewReceipt && input.reviewReceipt.nextAllowedTarget !== "FUNDTRACKER_REVIEW_HANDOFF") {
    refusalReasons.push("AUTHORIZED_REVIEW_RECEIPT_REQUIRED");
    requiredCorrections.push("Review receipt must authorize FundTrackerAI handoff only.");
  }

  if (!hasText(input.fundTrackerDecisionRef)) {
    refusalReasons.push("FUNDTRACKER_REFERENCE_REQUIRED");
    requiredCorrections.push("Preserve FundTrackerAI decision reference.");
  }

  if (input.syntheticAuthorityClaimed) {
    refusalReasons.push("SYNTHETIC_AUTHORITY_ATTEMPT_REFUSED");
    requiredCorrections.push("Remove synthetic authority claim.");
  }

  if (
    input.paiSafeSurfaceState.paiSafeCreatesTransactionTruth !== false ||
    input.paiSafeSurfaceState.paiSafeOverridesFundTrackerAI !== false ||
    input.paiSafeSurfaceState.authority !== "DISPLAY_ONLY"
  ) {
    refusalReasons.push("PAI_SAFE_CANNOT_AUTHORIZE_CONSEQUENCE");
    requiredCorrections.push("PAI-SAFE must remain display only.");
  }

  if (!input.proofHealth.ledgerChainVerified || !input.proofHealth.fileLedgerVerified) {
    refusalReasons.push("LEDGER_CHAIN_NOT_VERIFIED");
    requiredCorrections.push("Verify ledger chain and file ledger before consequence handoff.");
  }

  if (!input.proofHealth.registryReceiptVerified) {
    refusalReasons.push("REGISTRY_RECEIPT_NOT_VERIFIED");
    requiredCorrections.push("Verify SoulRegistry? receipt before consequence handoff.");
  }

  if (!input.proofHealth.fraudResistanceReportFresh) {
    refusalReasons.push("FRESH_FRAUD_PRESSURE_RECHECK_REQUIRED");
    requiredCorrections.push("Re-run fraud pressure check before consequence handoff.");
  }

  if (input.fraudPressureDecision.severity === "CRITICAL") {
    refusalReasons.push("CRITICAL_FRAUD_PRESSURE_ACTIVE");
    requiredCorrections.push("Critical fraud pressure must be resolved before consequence handoff.");
  }

  if (input.replayPressureCount > 0) {
    refusalReasons.push("REPLAY_PRESSURE_ACTIVE");
    requiredCorrections.push("Resolve replay pressure before consequence handoff.");
  }

  if (input.timingWindow.actualSkewMs > input.timingWindow.maxAllowedSkewMs) {
    refusalReasons.push("TIME_WINDOW_EXPIRED");
    requiredCorrections.push("Generate a fresh moving-target verification window.");
  }

  if (input.driftSignals.some((signal) => signal.active)) {
    refusalReasons.push("DRIFT_SIGNAL_ACTIVE");
    requiredCorrections.push("Resolve active drift signals before consequence handoff.");
  }

  if (input.paiSafeSurfaceState.status === "activated" && !hasText(input.activatedTransactionStateRef)) {
    refusalReasons.push("ACTIVATED_TRANSACTION_STATE_REQUIRED");
    requiredCorrections.push("Activated display requires Activated Transaction State reference.");
  }

  return {
    refusalReasons: Array.from(new Set(refusalReasons)),
    requiredCorrections: Array.from(new Set(requiredCorrections))
  };
}

function routeDecision(
  input: ConsequenceIntelligenceInput,
  score: ConsequenceScoreBreakdown,
  refusalReasons: ConsequenceRefusalCode[]
): { status: ConsequenceStatus; route: ConsequenceRoute } {
  if (refusalReasons.includes("SYNTHETIC_AUTHORITY_ATTEMPT_REFUSED")) {
    return { status: "CONSEQUENCE_INTELLIGENCE_REFUSED", route: "INSTANT_REFUSE" };
  }

  if (
    refusalReasons.includes("LEDGER_CHAIN_NOT_VERIFIED") ||
    refusalReasons.includes("REGISTRY_RECEIPT_NOT_VERIFIED") ||
    refusalReasons.includes("REPLAY_PRESSURE_ACTIVE")
  ) {
    return { status: "CONSEQUENCE_INTELLIGENCE_HELD", route: "CONTINUE_HOLD" };
  }

  if (refusalReasons.length > 0) {
    return { status: "CONSEQUENCE_INTELLIGENCE_HELD", route: "HUMAN_REVIEW_REQUIRED" };
  }

  if (
    input.paiSafeSurfaceState.status === "activated" &&
    hasText(input.activatedTransactionStateRef) &&
    score.aggregateScore >= 92
  ) {
    return {
      status: "CONSEQUENCE_INTELLIGENCE_ACTIVATION_ELIGIBLE",
      route: "ACTIVATION_ELIGIBILITY_READY"
    };
  }

  return {
    status: "CONSEQUENCE_INTELLIGENCE_HANDOFF_READY",
    route: "FUNDTRACKER_REVERIFY_HANDOFF"
  };
}

export async function evaluateConsequenceIntelligence(
  input: ConsequenceIntelligenceInput
): Promise<ConsequenceIntelligenceDecision> {
  const confidenceScore = scoreConsequence(input);
  const challenge = await buildMovingTargetChallenge(input);
  const { refusalReasons, requiredCorrections } = collectRefusals(input);
  const routed = routeDecision(input, confidenceScore, refusalReasons);

  const consequenceEligible =
    routed.route === "FUNDTRACKER_REVERIFY_HANDOFF" ||
    routed.route === "ACTIVATION_ELIGIBILITY_READY";

  const activationEligibilityPrecheckPassed = routed.route === "ACTIVATION_ELIGIBILITY_READY";

  return {
    status: routed.status,
    route: routed.route,
    confidenceScore,
    challenge,
    refusalReasons,
    requiredCorrections,
    consequenceEligible,
    fundTrackerReverificationRequired: consequenceEligible,
    activationEligibilityPrecheckPassed,
    boundary: {
      decisionIsNotPaymentAuthority: true,
      decisionIsNotTransactionTruth: true,
      decisionIsNotCustodyTransfer: true,
      decisionIsNotRuntimeActivation: true,
      paiSafeRemainsDisplayOnly: true,
      humanReceiptIsNotActivation: true,
      fundTrackerMustStillAuthorizeConsequence: true,
      machineCanRefuseButCannotAuthorizeConsequence: true
    }
  };
}
