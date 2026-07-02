import type {
  FraudAttackObservation,
  FraudPressureRoute,
  FraudSeverityTier
} from "../adaptive-fraud-pressure-matrix";
import type {
  AdaptiveRefusalPolicy,
  ForecastConfidence,
  FutureVectorSimulation,
  MutationFamilyClass,
  MutationFamilyProfile,
  PredictiveFirewallRefusalCode,
  PredictiveFraudFirewallDecision
} from "./predictiveFraudMutationContracts";

function nowIso(): string {
  return new Date().toISOString();
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function severityRank(severity: FraudSeverityTier): number {
  if (severity === "CRITICAL") return 4;
  if (severity === "HIGH") return 3;
  if (severity === "MEDIUM") return 2;
  return 1;
}

function maxSeverity(values: FraudSeverityTier[]): FraudSeverityTier {
  return values.reduce<FraudSeverityTier>((max, current) =>
    severityRank(current) > severityRank(max) ? current : max
  , "LOW");
}

function classifyVector(vector: FraudAttackObservation["vector"], mutationFamily?: string): MutationFamilyClass {
  if (vector.includes("HASH")) return "HASH_MUTATION";
  if (vector.includes("AUTHORITY") || vector.includes("DESTINATION")) return "AUTHORITY_CONFUSION";
  if (vector.includes("REGISTRY")) return "REGISTRY_FORGERY";
  if (vector.includes("BOUNDARY")) return "BOUNDARY_DOWNGRADE";
  if (vector.includes("LEAK")) return "PUBLIC_PRIVATE_LEAKAGE";
  if (vector.includes("REPLAY") || vector.includes("SWAP")) return "REPLAY_AND_SWAP";
  if (vector.includes("SYNTHETIC")) return "SYNTHETIC_PROOF";
  if ((mutationFamily ?? "").toLowerCase().includes("drift")) return "DRIFT_PRESSURE";
  return "UNKNOWN_MUTATION_FAMILY";
}

function severityForVector(vector: FraudAttackObservation["vector"]): FraudSeverityTier {
  if (
    vector === "BOUNDARY_DOWNGRADE" ||
    vector === "RAW_FINANCIAL_PUBLIC_LEAK" ||
    vector === "PRIVATE_CUSTODY_PATH_PUBLIC_LEAK" ||
    vector === "SYNTHETIC_RECEIPT" ||
    vector === "ANCHOR_REPLAY_WITH_DIFFERENT_PROJECTION" ||
    vector === "RECEIPT_SWAP" ||
    vector === "SOURCE_AUTHORITY_MUTATION"
  ) {
    return "CRITICAL";
  }

  if (
    vector === "PROJECTION_HASH_MUTATION" ||
    vector === "LEDGER_ENTRY_HASH_MUTATION" ||
    vector === "DESTINATION_MUTATION" ||
    vector === "REGISTRY_NAME_MUTATION" ||
    vector === "RAW_PROJECTION_PUBLIC_LEAK"
  ) {
    return "HIGH";
  }

  return "MEDIUM";
}

function forecastConfidence(attempts: number, uniqueActors: number, mutationFamilyCount: number): ForecastConfidence {
  const pressure = attempts + uniqueActors + mutationFamilyCount;
  if (pressure >= 7) return "HIGH";
  if (pressure >= 4) return "MEDIUM";
  return "LOW";
}

function nextPatternsForFamily(familyClass: MutationFamilyClass): string[] {
  if (familyClass === "HASH_MUTATION") {
    return [
      "partial-hash-prefix collision attempt",
      "hash replay with valid-looking stale anchor",
      "cross-ledger hash substitution"
    ];
  }

  if (familyClass === "AUTHORITY_CONFUSION") {
    return [
      "processor authority mimicry",
      "FinTechionAI oversight treated as command",
      "PAI-SAFE display state promoted into truth"
    ];
  }

  if (familyClass === "REGISTRY_FORGERY") {
    return [
      "SoulRegistry? name spoof",
      "receipt shell copied with altered anchor",
      "public anchor cloned across transaction ref"
    ];
  }

  if (familyClass === "BOUNDARY_DOWNGRADE") {
    return [
      "non-authority flag removal",
      "receipt converted into entitlement claim",
      "human review handoff treated as activation"
    ];
  }

  if (familyClass === "PUBLIC_PRIVATE_LEAKAGE") {
    return [
      "private custody pointer injected into public receipt",
      "ledger-safe summary body exposed as public proof",
      "raw source reference inserted into registry anchor"
    ];
  }

  if (familyClass === "REPLAY_AND_SWAP") {
    return [
      "valid receipt replayed against new transaction",
      "anchor swapped across projection family",
      "same-window challenge reused after expiry"
    ];
  }

  if (familyClass === "SYNTHETIC_PROOF") {
    return [
      "fabricated review receipt",
      "synthetic Activated Transaction State reference",
      "model-authored proof without artifact chain"
    ];
  }

  if (familyClass === "DRIFT_PRESSURE") {
    return [
      "valid T0 transaction becomes suspect at T1",
      "proof health degradation during consequence window",
      "risk route drift after human handoff"
    ];
  }

  return [
    "unknown mutation requires quarantine",
    "unknown mutation requires human review",
    "unknown mutation requires taxonomy expansion"
  ];
}

function routeForSeverity(severity: FraudSeverityTier): FraudPressureRoute {
  if (severity === "CRITICAL") return "CRITICAL_ESCALATION";
  if (severity === "HIGH") return "HUMAN_REVIEW";
  if (severity === "MEDIUM") return "MACHINE_HOLD";
  return "MACHINE_REFUSE";
}

export function buildMutationFamilyProfiles(
  observations: FraudAttackObservation[]
): MutationFamilyProfile[] {
  const grouped = new Map<MutationFamilyClass, FraudAttackObservation[]>();

  for (const observation of observations) {
    const familyClass = classifyVector(observation.vector, observation.mutationFamily);
    const existing = grouped.get(familyClass) ?? [];
    existing.push(observation);
    grouped.set(familyClass, existing);
  }

  const now = nowIso();

  return Array.from(grouped.entries()).map(([familyClass, items]) => {
    const sourceVectors = unique(items.map((item) => item.vector));
    const actors = unique(items.map((item) => item.actorFingerprint ?? "").filter(Boolean));
    const sessions = unique(items.map((item) => item.sessionFingerprint ?? "").filter(Boolean));
    const mutationFamilies = unique(items.map((item) => item.mutationFamily ?? "").filter(Boolean));
    const observedSeverityFloor = maxSeverity(sourceVectors.map(severityForVector));

    return {
      familyId: `mutation_family_${familyClass.toLowerCase()}`,
      familyClass,
      sourceVectors,
      attemptsObserved: items.length,
      uniqueActorCount: actors.length,
      uniqueSessionCount: sessions.length,
      mutationFamilies,
      observedSeverityFloor,
      forecastConfidence: forecastConfidence(items.length, actors.length, mutationFamilies.length),
      likelyNextMutationPatterns: nextPatternsForFamily(familyClass),
      createdAt: now,
      updatedAt: now,
      boundary: {
        profileIsNotConfirmedThreat: true,
        profileDoesNotRefuseTransaction: true,
        profileDoesNotCreateAuthority: true
      }
    };
  });
}

export function simulateFutureVectors(
  profiles: MutationFamilyProfile[]
): FutureVectorSimulation[] {
  const simulations: FutureVectorSimulation[] = [];

  for (const profile of profiles) {
    profile.likelyNextMutationPatterns.forEach((pattern, index) => {
      const severity = profile.observedSeverityFloor;
      simulations.push({
        simulationId: `simulation_${profile.familyId}_${index + 1}`,
        familyId: profile.familyId,
        familyClass: profile.familyClass,
        predictedVectorId: `${profile.familyClass}_PREDICTED_${index + 1}`,
        predictedPattern: pattern,
        predictedSeverityFloor: severity,
        recommendedRouteIfTriggered: routeForSeverity(severity),
        triggerConditions: [
          `actual signal matches family: ${profile.familyClass}`,
          `actual signal matches pattern: ${pattern}`,
          "artifact reference or boundary flag mismatch observed",
          "live transaction/projection/receipt context present"
        ],
        forecastConfidence: profile.forecastConfidence,
        boundary: {
          simulationIsForecastOnly: true,
          simulationIsNotEvidence: true,
          simulationCannotRefuseWithoutActualSignal: true,
          simulationDoesNotCreateTransactionTruth: true
        }
      });
    });
  }

  return simulations;
}

export function generateAdaptiveRefusalPolicies(
  simulations: FutureVectorSimulation[]
): AdaptiveRefusalPolicy[] {
  return simulations.map((simulation) => ({
    policyId: `policy_${simulation.predictedVectorId}`,
    simulationId: simulation.simulationId,
    predictedVectorId: simulation.predictedVectorId,
    policyMode: "PRECONFIGURED_REFUSAL_POSTURE",
    activeOnlyAfterSignal: true,
    triggerConditions: simulation.triggerConditions,
    routeIfTriggered: simulation.recommendedRouteIfTriggered,
    severityIfTriggered: simulation.predictedSeverityFloor,
    refusalLanguage:
      "Forecast policy prepared. Refusal may only execute after actual signal trigger, artifact context, and boundary mismatch are present.",
    boundary: {
      policyIsNotPaymentAuthority: true,
      policyIsNotTransactionTruth: true,
      policyIsNotCustodyTransfer: true,
      policyIsNotRuntimeActivation: true,
      predictionDoesNotEqualEvidence: true,
      noTransactionRefusalWithoutActualSignal: true,
      fundTrackerAIRemainsTransactionTruth: true
    }
  }));
}

export function evaluatePredictiveFraudFirewall(
  observations: FraudAttackObservation[]
): PredictiveFraudFirewallDecision {
  const refusalReasons: PredictiveFirewallRefusalCode[] = [];
  const requiredCorrections: string[] = [];

  if (observations.length === 0) {
    refusalReasons.push("FORECAST_INPUT_REQUIRED");
    requiredCorrections.push("Provide observed attack pressure before generating predictive taxonomy.");
  }

  const profiles = buildMutationFamilyProfiles(observations);
  const simulations = simulateFutureVectors(profiles);
  const policies = generateAdaptiveRefusalPolicies(simulations);

  if (profiles.some((profile) => profile.familyClass === "UNKNOWN_MUTATION_FAMILY")) {
    refusalReasons.push("UNKNOWN_FAMILY_REQUIRES_REVIEW");
    requiredCorrections.push("Unknown mutation family requires human taxonomy review.");
  }

  if (policies.some((policy) => policy.activeOnlyAfterSignal !== true)) {
    refusalReasons.push("PREDICTION_ONLY_CANNOT_REFUSE_TRANSACTION");
    requiredCorrections.push("Policy must remain inactive until actual signal trigger.");
  }

  if (policies.some((policy) => policy.triggerConditions.length === 0)) {
    refusalReasons.push("POLICY_MISSING_TRIGGER_CONDITION");
    requiredCorrections.push("Each predictive policy requires trigger conditions.");
  }

  const authorityBreach = policies.some((policy) =>
    policy.boundary.policyIsNotPaymentAuthority !== true ||
    policy.boundary.policyIsNotTransactionTruth !== true ||
    policy.boundary.noTransactionRefusalWithoutActualSignal !== true ||
    policy.boundary.fundTrackerAIRemainsTransactionTruth !== true
  );

  if (authorityBreach) {
    refusalReasons.push("POLICY_ATTEMPTS_TO_CREATE_AUTHORITY");
    requiredCorrections.push("Policy boundaries must preserve non-authority posture.");
  }

  return {
    status: refusalReasons.length === 0 ? "FORECAST_POLICY_READY" : "FORECAST_POLICY_REFUSED",
    taxonomyVersion: `predictive_taxonomy_${profiles.length}_${simulations.length}`,
    profiles,
    simulations,
    policies,
    refusalReasons: unique(refusalReasons),
    requiredCorrections: unique(requiredCorrections),
    boundary: {
      forecastInformsPolicyOnly: true,
      forecastIsNotEvidence: true,
      predictionCannotRefuseTransactionAlone: true,
      firewallIsNotPaymentAuthority: true,
      firewallIsNotTransactionTruth: true,
      firewallIsNotCustodyTransfer: true,
      firewallIsNotRuntimeActivation: true,
      fundTrackerAIRemainsTransactionTruth: true,
      consequenceIntelligenceRemainsPreConsequenceGate: true
    }
  };
}
