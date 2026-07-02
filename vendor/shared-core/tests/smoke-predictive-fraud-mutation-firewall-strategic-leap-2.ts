import {
  evaluatePredictiveFraudFirewall,
  PREDICTIVE_FRAUD_MUTATION_FIREWALL_DOCTRINE
} from "../predictive-fraud-mutation-firewall";
import type { FraudAttackObservation } from "../adaptive-fraud-pressure-matrix";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

function obs(
  id: string,
  vector: FraudAttackObservation["vector"],
  actor: string,
  session: string,
  family: string
): FraudAttackObservation {
  return {
    observationId: id,
    vector,
    detected: true,
    refused: true,
    attemptedAt: "2026-04-28T14:00:00.000Z",
    targetProjectionId: "projection_leap2_001",
    targetAnchorId: "anchor_leap2_001",
    actorFingerprint: actor,
    sessionFingerprint: session,
    mutationFamily: family
  };
}

const observations: FraudAttackObservation[] = [
  obs("obs_hash_001", "ANCHOR_HASH_MUTATION", "actor_a", "session_a", "hash"),
  obs("obs_hash_002", "RECEIPT_HASH_MUTATION", "actor_b", "session_b", "hash-v2"),
  obs("obs_auth_001", "SOURCE_AUTHORITY_MUTATION", "actor_c", "session_c", "authority"),
  obs("obs_boundary_001", "BOUNDARY_DOWNGRADE", "actor_d", "session_d", "boundary"),
  obs("obs_boundary_002", "BOUNDARY_DOWNGRADE", "actor_e", "session_e", "boundary-v2"),
  obs("obs_leak_001", "RAW_FINANCIAL_PUBLIC_LEAK", "actor_f", "session_f", "leak"),
  obs("obs_replay_001", "ANCHOR_REPLAY_WITH_DIFFERENT_PROJECTION", "actor_g", "session_g", "replay"),
  obs("obs_synth_001", "SYNTHETIC_RECEIPT", "actor_h", "session_h", "synthetic")
];

assert(PREDICTIVE_FRAUD_MUTATION_FIREWALL_DOCTRINE.boundary.predictionDoesNotEqualEvidence === true, "Prediction does not equal evidence");
assert(PREDICTIVE_FRAUD_MUTATION_FIREWALL_DOCTRINE.boundary.noTransactionRefusalWithoutActualSignal === true, "No transaction refusal without actual signal");
assert(PREDICTIVE_FRAUD_MUTATION_FIREWALL_DOCTRINE.boundary.predictiveFirewallDoesNotOverrideFundTrackerAI === true, "Predictive firewall does not override FundTrackerAI");

const decision = evaluatePredictiveFraudFirewall(observations);

assert(decision.status === "FORECAST_POLICY_READY", "Predictive firewall policy ready");
assert(decision.profiles.length >= 6, "Self-updating taxonomy creates multiple mutation family profiles");
assert(decision.simulations.length >= decision.profiles.length * 3, "Future-vector simulation expands mutation families");
assert(decision.policies.length === decision.simulations.length, "Adaptive refusal policy generated for every simulation");

const hasBoundaryFamily = decision.profiles.some((profile) => profile.familyClass === "BOUNDARY_DOWNGRADE");
const hasLeakFamily = decision.profiles.some((profile) => profile.familyClass === "PUBLIC_PRIVATE_LEAKAGE");
const hasSyntheticFamily = decision.profiles.some((profile) => profile.familyClass === "SYNTHETIC_PROOF");

assert(hasBoundaryFamily === true, "Boundary downgrade family forecasted");
assert(hasLeakFamily === true, "Public/private leakage family forecasted");
assert(hasSyntheticFamily === true, "Synthetic proof family forecasted");

const boundaryProfile = decision.profiles.find((profile) => profile.familyClass === "BOUNDARY_DOWNGRADE");

assert(boundaryProfile !== undefined, "Boundary profile exists");
assert(boundaryProfile!.attemptsObserved === 2, "Boundary profile counts repeated attempts");
assert(boundaryProfile!.observedSeverityFloor === "CRITICAL", "Boundary severity floor is critical");
assert(boundaryProfile!.likelyNextMutationPatterns.includes("human review handoff treated as activation"), "Boundary future pattern forecasted");

const allSimulationsRemainForecastOnly = decision.simulations.every((simulation) =>
  simulation.boundary.simulationIsForecastOnly === true &&
  simulation.boundary.simulationIsNotEvidence === true &&
  simulation.boundary.simulationCannotRefuseWithoutActualSignal === true &&
  simulation.boundary.simulationDoesNotCreateTransactionTruth === true
);

assert(allSimulationsRemainForecastOnly === true, "All future-vector simulations remain forecast only");

const allPoliciesRemainBounded = decision.policies.every((policy) =>
  policy.activeOnlyAfterSignal === true &&
  policy.boundary.predictionDoesNotEqualEvidence === true &&
  policy.boundary.noTransactionRefusalWithoutActualSignal === true &&
  policy.boundary.policyIsNotPaymentAuthority === true &&
  policy.boundary.policyIsNotTransactionTruth === true &&
  policy.boundary.policyIsNotRuntimeActivation === true &&
  policy.boundary.fundTrackerAIRemainsTransactionTruth === true
);

assert(allPoliciesRemainBounded === true, "All adaptive refusal policies remain bounded");

const criticalPolicies = decision.policies.filter((policy) => policy.severityIfTriggered === "CRITICAL");

assert(criticalPolicies.length > 0, "Critical forecast policies generated");
assert(
  criticalPolicies.every((policy) => policy.routeIfTriggered === "CRITICAL_ESCALATION"),
  "Critical forecast policies route to critical escalation if triggered"
);

const emptyDecision = evaluatePredictiveFraudFirewall([]);

assert(emptyDecision.status === "FORECAST_POLICY_REFUSED", "Empty forecast input refused");
assert(emptyDecision.refusalReasons.includes("FORECAST_INPUT_REQUIRED"), "Forecast input required refusal present");

const expandedDecision = evaluatePredictiveFraudFirewall([
  ...observations,
  obs("obs_registry_001", "REGISTRY_NAME_MUTATION", "actor_i", "session_i", "registry")
]);

assert(expandedDecision.profiles.length >= decision.profiles.length, "Taxonomy can expand with new observed family");
assert(expandedDecision.simulations.length >= decision.simulations.length, "Simulation set expands or holds with new evidence");

assert(decision.boundary.forecastInformsPolicyOnly === true, "Forecast informs policy only");
assert(decision.boundary.forecastIsNotEvidence === true, "Forecast is not evidence");
assert(decision.boundary.predictionCannotRefuseTransactionAlone === true, "Prediction cannot refuse transaction alone");
assert(decision.boundary.firewallIsNotPaymentAuthority === true, "Firewall is not payment authority");
assert(decision.boundary.firewallIsNotTransactionTruth === true, "Firewall is not transaction truth");
assert(decision.boundary.firewallIsNotRuntimeActivation === true, "Firewall is not runtime activation");

console.log("");
console.log("PREDICTIVE_FRAUD_MUTATION_FIREWALL_STRATEGIC_LEAP_2_SMOKE=PASS");
