import type {
  FraudAttackObservation,
  FraudPressureRoute,
  FraudSeverityTier
} from "../adaptive-fraud-pressure-matrix";

export type ForecastConfidence =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type MutationFamilyClass =
  | "HASH_MUTATION"
  | "AUTHORITY_CONFUSION"
  | "REGISTRY_FORGERY"
  | "BOUNDARY_DOWNGRADE"
  | "PUBLIC_PRIVATE_LEAKAGE"
  | "REPLAY_AND_SWAP"
  | "SYNTHETIC_PROOF"
  | "DRIFT_PRESSURE"
  | "UNKNOWN_MUTATION_FAMILY";

export type ForecastBoundaryStatus =
  | "FORECAST_POLICY_READY"
  | "FORECAST_POLICY_REFUSED";

export type PredictiveFirewallRefusalCode =
  | "FORECAST_INPUT_REQUIRED"
  | "UNKNOWN_FAMILY_REQUIRES_REVIEW"
  | "FORECAST_CANNOT_BE_CONFIRMED_THREAT"
  | "PREDICTION_ONLY_CANNOT_REFUSE_TRANSACTION"
  | "POLICY_MISSING_TRIGGER_CONDITION"
  | "POLICY_ATTEMPTS_TO_CREATE_AUTHORITY"
  | "POLICY_ATTEMPTS_TO_BYPASS_FUNDTRACKER"
  | "TAXONOMY_DRIFT_REQUIRES_REVIEW";

export interface MutationFamilyProfile {
  familyId: string;
  familyClass: MutationFamilyClass;
  sourceVectors: FraudAttackObservation["vector"][];
  attemptsObserved: number;
  uniqueActorCount: number;
  uniqueSessionCount: number;
  mutationFamilies: string[];
  observedSeverityFloor: FraudSeverityTier;
  forecastConfidence: ForecastConfidence;
  likelyNextMutationPatterns: string[];
  createdAt: string;
  updatedAt: string;
  boundary: {
    profileIsNotConfirmedThreat: true;
    profileDoesNotRefuseTransaction: true;
    profileDoesNotCreateAuthority: true;
  };
}

export interface FutureVectorSimulation {
  simulationId: string;
  familyId: string;
  familyClass: MutationFamilyClass;
  predictedVectorId: string;
  predictedPattern: string;
  predictedSeverityFloor: FraudSeverityTier;
  recommendedRouteIfTriggered: FraudPressureRoute;
  triggerConditions: string[];
  forecastConfidence: ForecastConfidence;
  boundary: {
    simulationIsForecastOnly: true;
    simulationIsNotEvidence: true;
    simulationCannotRefuseWithoutActualSignal: true;
    simulationDoesNotCreateTransactionTruth: true;
  };
}

export interface AdaptiveRefusalPolicy {
  policyId: string;
  simulationId: string;
  predictedVectorId: string;
  policyMode: "PRECONFIGURED_REFUSAL_POSTURE";
  activeOnlyAfterSignal: true;
  triggerConditions: string[];
  routeIfTriggered: FraudPressureRoute;
  severityIfTriggered: FraudSeverityTier;
  refusalLanguage: string;
  boundary: {
    policyIsNotPaymentAuthority: true;
    policyIsNotTransactionTruth: true;
    policyIsNotCustodyTransfer: true;
    policyIsNotRuntimeActivation: true;
    predictionDoesNotEqualEvidence: true;
    noTransactionRefusalWithoutActualSignal: true;
    fundTrackerAIRemainsTransactionTruth: true;
  };
}

export interface PredictiveFraudFirewallDecision {
  status: ForecastBoundaryStatus;
  taxonomyVersion: string;
  profiles: MutationFamilyProfile[];
  simulations: FutureVectorSimulation[];
  policies: AdaptiveRefusalPolicy[];
  refusalReasons: PredictiveFirewallRefusalCode[];
  requiredCorrections: string[];
  boundary: {
    forecastInformsPolicyOnly: true;
    forecastIsNotEvidence: true;
    predictionCannotRefuseTransactionAlone: true;
    firewallIsNotPaymentAuthority: true;
    firewallIsNotTransactionTruth: true;
    firewallIsNotCustodyTransfer: true;
    firewallIsNotRuntimeActivation: true;
    fundTrackerAIRemainsTransactionTruth: true;
    consequenceIntelligenceRemainsPreConsequenceGate: true;
  };
}
