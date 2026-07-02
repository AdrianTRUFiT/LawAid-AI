import {
  FRAUDAI_ADVERSARIAL_POLICY
} from "../fraudai-adversarial-harness";
import {
  GTIS_CATEGORY_DEFINITION,
  assertPolicyCoverage,
  buildFraudAttackPatternMemory,
  buildFraudResistanceContinuityReport,
  evaluateFraudPressureObservation
} from "../adaptive-fraud-pressure-matrix";
import type { FraudAttackObservation } from "../adaptive-fraud-pressure-matrix";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

function observation(
  id: string,
  vector: FraudAttackObservation["vector"],
  attempt: number,
  actor: string,
  session: string,
  mutationFamily: string
): FraudAttackObservation {
  return {
    observationId: id,
    vector,
    detected: true,
    refused: true,
    attemptedAt: `2026-04-28T10:${String(attempt).padStart(2, "0")}:00.000Z`,
    targetProjectionId: "projection_stage7_001",
    targetAnchorId: "soulregistry_anchor_stage7_001",
    actorFingerprint: actor,
    sessionFingerprint: session,
    mutationFamily
  };
}

const observations: FraudAttackObservation[] = [
  observation("obs_001", "ANCHOR_HASH_MUTATION", 1, "actor_a", "session_a", "hash"),
  observation("obs_002", "RECEIPT_HASH_MUTATION", 2, "actor_a", "session_a", "hash"),
  observation("obs_003", "PROJECTION_HASH_MUTATION", 3, "actor_b", "session_b", "hash"),
  observation("obs_004", "LEDGER_ENTRY_HASH_MUTATION", 4, "actor_b", "session_b", "ledger"),
  observation("obs_005", "SOURCE_AUTHORITY_MUTATION", 5, "actor_c", "session_c", "authority"),
  observation("obs_006", "DESTINATION_MUTATION", 6, "actor_c", "session_c", "authority"),
  observation("obs_007", "REGISTRY_NAME_MUTATION", 7, "actor_d", "session_d", "registry"),
  observation("obs_008", "RECEIPT_SWAP", 8, "actor_d", "session_d", "swap"),
  observation("obs_009", "BOUNDARY_DOWNGRADE", 9, "actor_e", "session_e", "boundary"),
  observation("obs_010", "RAW_PROJECTION_PUBLIC_LEAK", 10, "actor_f", "session_f", "leak"),
  observation("obs_011", "RAW_FINANCIAL_PUBLIC_LEAK", 11, "actor_f", "session_f", "leak"),
  observation("obs_012", "PRIVATE_CUSTODY_PATH_PUBLIC_LEAK", 12, "actor_g", "session_g", "leak"),
  observation("obs_013", "SYNTHETIC_RECEIPT", 13, "actor_h", "session_h", "synthetic"),
  observation("obs_014", "ANCHOR_REPLAY_WITH_DIFFERENT_PROJECTION", 14, "actor_h", "session_h", "replay"),
  observation("obs_015", "BOUNDARY_DOWNGRADE", 15, "actor_i", "session_i", "boundary"),
  observation("obs_016", "BOUNDARY_DOWNGRADE", 16, "actor_j", "session_j", "boundary_v2"),
  observation("obs_017", "BOUNDARY_DOWNGRADE", 17, "actor_k", "session_k", "boundary_v3")
];

assert(GTIS_CATEGORY_DEFINITION.categoryName === "TRANSACTION_TRUTH_GOVERNANCE", "GTIS category name locked");
assert(GTIS_CATEGORY_DEFINITION.notFraudDetection === true, "GTIS is not fraud detection");
assert(GTIS_CATEGORY_DEFINITION.notPaymentProcessing === true, "GTIS is not payment processing");
assert(GTIS_CATEGORY_DEFINITION.notChargebackRecovery === true, "GTIS is not chargeback recovery");
assert(GTIS_CATEGORY_DEFINITION.governsPreActivationSeam === true, "GTIS governs pre-activation seam");
assert(GTIS_CATEGORY_DEFINITION.boundary.transportIsNotTruth === true, "Transport is not truth");
assert(GTIS_CATEGORY_DEFINITION.boundary.processorSuccessIsNotTruth === true, "Processor success is not truth");

assert(assertPolicyCoverage(FRAUDAI_ADVERSARIAL_POLICY) === true, "Stage 7 policy covers every Stage 6 vector");

const patternMemory = buildFraudAttackPatternMemory(observations);

assert(patternMemory.length === FRAUDAI_ADVERSARIAL_POLICY.requiredVectors.length, "Pattern memory covers all required vectors");

const boundaryPattern = patternMemory.find((pattern) => pattern.vector === "BOUNDARY_DOWNGRADE");

assert(boundaryPattern !== undefined, "Boundary downgrade pattern exists");
assert(boundaryPattern!.totalAttempts === 4, "Repeated boundary downgrade attempts counted");
assert(boundaryPattern!.uniqueActorFingerprints === 4, "Boundary downgrade unique actor pressure counted");
assert(boundaryPattern!.mutationFamilies.length === 3, "Boundary downgrade mutation family pressure counted");

const criticalDecision = evaluateFraudPressureObservation(observations[8]!, patternMemory);

assert(criticalDecision.vector === "BOUNDARY_DOWNGRADE", "Critical decision evaluated boundary downgrade");
assert(criticalDecision.severity === "CRITICAL", "Boundary downgrade routes as critical");
assert(
  criticalDecision.reasons.some((reason) => reason === "Policy severity floor: CRITICAL"),
  "Critical policy floor preserved"
);
assert(criticalDecision.route === "CRITICAL_ESCALATION", "Critical severity routes to critical escalation");
assert(criticalDecision.reviewRequired === true, "Critical route requires review");
assert(criticalDecision.machineRefused === true, "Critical route machine-refuses");
assert(criticalDecision.humanAuthorizationRequiredForConsequence === true, "Human authorization required for consequence");
assert(criticalDecision.boundary.scoringIsNotPaymentAuthority === true, "Scoring is not payment authority");
assert(criticalDecision.boundary.scoringIsNotTransactionTruth === true, "Scoring is not transaction truth");
assert(criticalDecision.boundary.routeDoesNotCreateActivation === true, "Routing does not create activation");

const report = buildFraudResistanceContinuityReport(observations, "stage7-smoke-window");

assert(report.categoryName === "TRANSACTION_TRUTH_GOVERNANCE", "Report category is transaction truth governance");
assert(report.totalObservations === observations.length, "Report observation count correct");
assert(report.totalEscaped === 0, "Report shows zero escaped observations");
assert(report.totalRefusedOrDetected === observations.length, "All observations refused or detected");
assert(report.severityCounts.CRITICAL > 0, "Report includes critical severity");
assert(report.routeCounts.CRITICAL_ESCALATION > 0, "Report includes critical escalation route");
assert(report.patternMemory.length === FRAUDAI_ADVERSARIAL_POLICY.requiredVectors.length, "Report includes full pattern memory");
assert(report.decisions.length === observations.length, "Report includes decisions for every observation");

assert(report.boundary.reportIsNotMarketingClaim === true, "Continuity report is not marketing claim");
assert(report.boundary.reportIsNotPaymentAuthority === true, "Continuity report is not payment authority");
assert(report.boundary.reportIsNotTransactionTruth === true, "Continuity report is not transaction truth");
assert(report.boundary.reportIsNotCustodyTransfer === true, "Continuity report is not custody transfer");
assert(report.boundary.reportRequiresHumanReviewForOperationalUse === true, "Operational use requires human review");

const everyDecisionPreservesBoundary = report.decisions.every(
  (decision) =>
    decision.boundary.scoringIsNotPaymentAuthority === true &&
    decision.boundary.scoringIsNotTransactionTruth === true &&
    decision.boundary.scoringIsNotCustodyTransfer === true &&
    decision.boundary.humanAuthorizationRequiredForConsequence === true
);

assert(everyDecisionPreservesBoundary === true, "Every decision preserves non-authority boundaries");

console.log("");
console.log("ADAPTIVE_FRAUD_PRESSURE_MATRIX_STAGE_7_SMOKE=PASS");



