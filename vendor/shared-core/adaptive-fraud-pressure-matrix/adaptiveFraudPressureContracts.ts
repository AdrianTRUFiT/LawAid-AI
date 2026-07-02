import type { FraudAttackVector } from "../fraudai-adversarial-harness";

export type GTISCategoryName = "TRANSACTION_TRUTH_GOVERNANCE";

export type FraudSeverityTier =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type FraudPressureRoute =
  | "MACHINE_REFUSE"
  | "MACHINE_HOLD"
  | "HUMAN_REVIEW"
  | "CRITICAL_ESCALATION";

export type FraudPressureDecisionStatus =
  | "FRAUD_PRESSURE_ROUTED"
  | "FRAUD_PRESSURE_BLOCKED";

export interface FraudAttackObservation {
  observationId: string;
  vector: FraudAttackVector;
  detected: boolean;
  refused: boolean;
  attemptedAt: string;
  targetProjectionId: string;
  targetAnchorId: string;
  sourceIpFingerprint?: string;
  actorFingerprint?: string;
  sessionFingerprint?: string;
  mutationFamily?: string;
}

export interface FraudAttackPatternMemory {
  vector: FraudAttackVector;
  totalAttempts: number;
  refusedOrDetectedAttempts: number;
  escapedAttempts: number;
  firstSeenAt: string;
  lastSeenAt: string;
  uniqueActorFingerprints: number;
  uniqueSessionFingerprints: number;
  mutationFamilies: string[];
}

export interface FraudRiskScoreBreakdown {
  transactionIntegrityScore: number;
  artifactIntegrityScore: number;
  registryIntegrityScore: number;
  boundaryIntegrityScore: number;
  repetitionPressureScore: number;
  authorityConfusionScore: number;
  publicPrivateLeakScore: number;
  aggregateScore: number;
}

export interface FraudPressureDecision {
  status: FraudPressureDecisionStatus;
  observationId: string;
  vector: FraudAttackVector;
  severity: FraudSeverityTier;
  route: FraudPressureRoute;
  score: FraudRiskScoreBreakdown;
  reviewRequired: boolean;
  machineRefused: boolean;
  humanAuthorizationRequiredForConsequence: boolean;
  reasons: string[];
  recommendedAction: string;
  boundary: {
    scoringIsNotPaymentAuthority: true;
    scoringIsNotTransactionTruth: true;
    scoringIsNotCustodyTransfer: true;
    routeDoesNotCreateActivation: true;
    humanAuthorizationRequiredForConsequence: true;
    fundTrackerAIRemainsTransactionTruth: true;
    registryVerifierRemainsReadOnly: true;
  };
}

export interface FraudResistanceContinuityReport {
  reportId: string;
  categoryName: GTISCategoryName;
  generatedAt: string;
  windowLabel: string;
  totalObservations: number;
  totalRefusedOrDetected: number;
  totalEscaped: number;
  severityCounts: Record<FraudSeverityTier, number>;
  routeCounts: Record<FraudPressureRoute, number>;
  patternMemory: FraudAttackPatternMemory[];
  decisions: FraudPressureDecision[];
  proofLine: string;
  boundary: {
    reportIsNotMarketingClaim: true;
    reportIsNotPaymentAuthority: true;
    reportIsNotTransactionTruth: true;
    reportIsNotCustodyTransfer: true;
    reportRequiresHumanReviewForOperationalUse: true;
  };
}

export interface GTISCategoryDefinition {
  categoryName: GTISCategoryName;
  plainLanguageName: "Transaction Truth Governance";
  categoryClaim: string;
  checkmateLine: string;
  categoryDistinction: string;
  notFraudDetection: true;
  notPaymentProcessing: true;
  notChargebackRecovery: true;
  governsPreActivationSeam: true;
  boundary: {
    transportIsNotTruth: true;
    processorSuccessIsNotTruth: true;
    artifactGovernedConsequenceIsTruth: true;
    humanAuthorizationRequiredAtExecutionBoundary: true;
  };
}

