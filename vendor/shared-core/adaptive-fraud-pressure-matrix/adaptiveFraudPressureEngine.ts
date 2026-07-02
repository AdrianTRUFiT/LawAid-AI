import type {
  FraudAttackObservation,
  FraudAttackPatternMemory,
  FraudPressureDecision,
  FraudPressureRoute,
  FraudResistanceContinuityReport,
  FraudRiskScoreBreakdown,
  FraudSeverityTier
} from "./adaptiveFraudPressureContracts";
import { GTIS_CATEGORY_DEFINITION } from "./gtisCategoryDefinition";
import { getVectorWeight } from "./adaptiveFraudPressurePolicy";
import {
  buildFraudAttackPatternMemory,
  getPatternForVector
} from "./fraudPatternMemory";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function severityRank(severity: FraudSeverityTier): number {
  if (severity === "CRITICAL") return 4;
  if (severity === "HIGH") return 3;
  if (severity === "MEDIUM") return 2;
  return 1;
}

function maxSeverity(a: FraudSeverityTier, b: FraudSeverityTier): FraudSeverityTier {
  return severityRank(a) >= severityRank(b) ? a : b;
}

function calculateRepetitionPressure(pattern: FraudAttackPatternMemory | undefined): number {
  if (!pattern) return 0;

  const attemptPressure = Math.min(pattern.totalAttempts * 6, 40);
  const actorPressure = Math.min(pattern.uniqueActorFingerprints * 8, 24);
  const sessionPressure = Math.min(pattern.uniqueSessionFingerprints * 6, 18);
  const mutationPressure = Math.min(pattern.mutationFamilies.length * 6, 18);

  return clampScore(attemptPressure + actorPressure + sessionPressure + mutationPressure);
}

function isAuthorityVector(vector: string): boolean {
  return (
    vector === "SOURCE_AUTHORITY_MUTATION" ||
    vector === "DESTINATION_MUTATION" ||
    vector === "REGISTRY_NAME_MUTATION" ||
    vector === "BOUNDARY_DOWNGRADE" ||
    vector === "SYNTHETIC_RECEIPT"
  );
}

function isLeakVector(vector: string): boolean {
  return (
    vector === "RAW_PROJECTION_PUBLIC_LEAK" ||
    vector === "RAW_FINANCIAL_PUBLIC_LEAK" ||
    vector === "PRIVATE_CUSTODY_PATH_PUBLIC_LEAK"
  );
}

function scoreObservation(
  observation: FraudAttackObservation,
  pattern: FraudAttackPatternMemory | undefined
): FraudRiskScoreBreakdown {
  const weight = getVectorWeight(observation.vector);

  const transactionIntegrityScore = clampScore(weight.baseRisk);
  const artifactIntegrityScore = clampScore(
    observation.vector.includes("HASH") || observation.vector.includes("REPLAY") || observation.vector.includes("SWAP")
      ? weight.baseRisk + 8
      : weight.baseRisk - 8
  );
  const registryIntegrityScore = clampScore(
    observation.vector.includes("REGISTRY") || observation.vector.includes("RECEIPT") || observation.vector.includes("ANCHOR")
      ? weight.baseRisk + 6
      : weight.baseRisk - 10
  );
  const boundaryIntegrityScore = clampScore(
    observation.vector === "BOUNDARY_DOWNGRADE" ? 100 : weight.baseRisk
  );
  const repetitionPressureScore = calculateRepetitionPressure(pattern);
  const authorityConfusionScore = clampScore(isAuthorityVector(observation.vector) ? weight.baseRisk + 8 : 20);
  const publicPrivateLeakScore = clampScore(isLeakVector(observation.vector) ? 100 : 10);

  const aggregateScore = clampScore(
    transactionIntegrityScore * 0.18 +
      artifactIntegrityScore * 0.18 +
      registryIntegrityScore * 0.14 +
      boundaryIntegrityScore * 0.18 +
      repetitionPressureScore * 0.12 +
      authorityConfusionScore * 0.10 +
      publicPrivateLeakScore * 0.10
  );

  return {
    transactionIntegrityScore,
    artifactIntegrityScore,
    registryIntegrityScore,
    boundaryIntegrityScore,
    repetitionPressureScore,
    authorityConfusionScore,
    publicPrivateLeakScore,
    aggregateScore
  };
}

function classifySeverityFromScore(score: FraudRiskScoreBreakdown): FraudSeverityTier {
  if (score.aggregateScore >= 85) return "CRITICAL";
  if (score.aggregateScore >= 70) return "HIGH";
  if (score.aggregateScore >= 45) return "MEDIUM";
  return "LOW";
}

function classifySeverity(score: FraudRiskScoreBreakdown, policySeverity: FraudSeverityTier): FraudSeverityTier {
  const scoreSeverity = classifySeverityFromScore(score);
  return maxSeverity(scoreSeverity, policySeverity);
}

function routeForSeverity(severity: FraudSeverityTier): FraudPressureRoute {
  if (severity === "CRITICAL") return "CRITICAL_ESCALATION";
  if (severity === "HIGH") return "HUMAN_REVIEW";
  if (severity === "MEDIUM") return "MACHINE_HOLD";
  return "MACHINE_REFUSE";
}

function recommendedActionForRoute(route: FraudPressureRoute): string {
  if (route === "CRITICAL_ESCALATION") {
    return "Immediate machine refusal, preserved evidence packet, and authorized human review before any consequence.";
  }

  if (route === "HUMAN_REVIEW") {
    return "Machine refusal with review packet routed for human adjudication.";
  }

  if (route === "MACHINE_HOLD") {
    return "Hold state with pattern memory update and no downstream consequence.";
  }

  return "Machine refusal with continuity record retained.";
}

export function evaluateFraudPressureObservation(
  observation: FraudAttackObservation,
  patternMemory: FraudAttackPatternMemory[]
): FraudPressureDecision {
  const pattern = getPatternForVector(patternMemory, observation.vector);
  const score = scoreObservation(observation, pattern);
  const weight = getVectorWeight(observation.vector);
  const severity = classifySeverity(score, weight.severity);
  const route = routeForSeverity(severity);

  const reasons = [
    weight.reason,
    `Policy severity floor: ${weight.severity}`,
    `Aggregate risk score: ${score.aggregateScore}`,
    `Severity tier: ${severity}`,
    `Route: ${route}`,
    "Transport is not truth.",
    "Processor success is not truth.",
    "Artifact-governed consequence is truth."
  ];

  return {
    status: "FRAUD_PRESSURE_ROUTED",
    observationId: observation.observationId,
    vector: observation.vector,
    severity,
    route,
    score,
    reviewRequired: route === "HUMAN_REVIEW" || route === "CRITICAL_ESCALATION",
    machineRefused: true,
    humanAuthorizationRequiredForConsequence: true,
    reasons,
    recommendedAction: recommendedActionForRoute(route),
    boundary: {
      scoringIsNotPaymentAuthority: true,
      scoringIsNotTransactionTruth: true,
      scoringIsNotCustodyTransfer: true,
      routeDoesNotCreateActivation: true,
      humanAuthorizationRequiredForConsequence: true,
      fundTrackerAIRemainsTransactionTruth: true,
      registryVerifierRemainsReadOnly: true
    }
  };
}

export function buildFraudResistanceContinuityReport(
  observations: FraudAttackObservation[],
  windowLabel: string
): FraudResistanceContinuityReport {
  const patternMemory = buildFraudAttackPatternMemory(observations);
  const decisions = observations.map((observation) =>
    evaluateFraudPressureObservation(observation, patternMemory)
  );

  const severityCounts = {
    LOW: decisions.filter((decision) => decision.severity === "LOW").length,
    MEDIUM: decisions.filter((decision) => decision.severity === "MEDIUM").length,
    HIGH: decisions.filter((decision) => decision.severity === "HIGH").length,
    CRITICAL: decisions.filter((decision) => decision.severity === "CRITICAL").length
  };

  const routeCounts = {
    MACHINE_REFUSE: decisions.filter((decision) => decision.route === "MACHINE_REFUSE").length,
    MACHINE_HOLD: decisions.filter((decision) => decision.route === "MACHINE_HOLD").length,
    HUMAN_REVIEW: decisions.filter((decision) => decision.route === "HUMAN_REVIEW").length,
    CRITICAL_ESCALATION: decisions.filter((decision) => decision.route === "CRITICAL_ESCALATION").length
  };

  const totalRefusedOrDetected = observations.filter(
    (observation) => observation.refused || observation.detected
  ).length;

  const totalEscaped = observations.length - totalRefusedOrDetected;

  return {
    reportId: `fraud_resistance_continuity_${Date.now()}`,
    categoryName: GTIS_CATEGORY_DEFINITION.categoryName,
    generatedAt: new Date().toISOString(),
    windowLabel,
    totalObservations: observations.length,
    totalRefusedOrDetected,
    totalEscaped,
    severityCounts,
    routeCounts,
    patternMemory,
    decisions,
    proofLine:
      "Fraud pressure was scored, classified, routed, and preserved without creating payment authority, transaction truth, custody transfer, or runtime activation.",
    boundary: {
      reportIsNotMarketingClaim: true,
      reportIsNotPaymentAuthority: true,
      reportIsNotTransactionTruth: true,
      reportIsNotCustodyTransfer: true,
      reportRequiresHumanReviewForOperationalUse: true
    }
  };
}

