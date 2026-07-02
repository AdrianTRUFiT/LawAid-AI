import {
  buildPaiSafeSurfaceProjection,
  runPaiSafePressureHarness,
  PAI_SAFE_SURFACE_FAILURE_TAXONOMY_DOCTRINE
} from "../pai-safe-surface-failure-taxonomy";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(PAI_SAFE_SURFACE_FAILURE_TAXONOMY_DOCTRINE.boundary.paiSafeIsProjectionOnly === true, "Doctrine locks PAI-SAFE as projection only");
assert(PAI_SAFE_SURFACE_FAILURE_TAXONOMY_DOCTRINE.boundary.processorSuccessIsNotAuthority === true, "Doctrine locks processor success as non-authority");
assert(PAI_SAFE_SURFACE_FAILURE_TAXONOMY_DOCTRINE.boundary.fundTrackerAIRemainsTruthSource === true, "Doctrine locks FundTrackerAI as truth source");
assert(PAI_SAFE_SURFACE_FAILURE_TAXONOMY_DOCTRINE.boundary.displayIsNotAuthority === true, "Doctrine locks display as non-authority");

const processorOnly = buildPaiSafeSurfaceProjection({
  transactionRef: "txn_processor_only_smoke",
  processorEventRef: "processor_evt_smoke",
  processorTransportState: "processor_success",
  fundTrackerVerificationState: "fundtracker_not_started",
  activatedTransactionArtifactState: "ats_absent"
});

assert(processorOnly.status === "processor_success_not_authority", "Processor success alone becomes non-authority display");
assert(processorOnly.failureClass === "PROCESSOR_ONLY_SUCCESS", "Processor-only success failure class set");
assert(processorOnly.safeToProceed === false, "Processor-only success not safe to proceed");
assert(processorOnly.downstreamActivationEligible === false, "Processor-only success not downstream eligible");
assert(processorOnly.visualDistinctions.processorSuccessIsAuthority === false, "Processor success is not authority");
assert(processorOnly.visualDistinctions.displayIsAuthority === false, "Display is not authority");
assert(processorOnly.boundary.paiSafeDoesNotVerifyTruth === true, "PAI-SAFE does not verify truth");
assert(processorOnly.boundary.paiSafeDoesNotMutateTransactionState === true, "PAI-SAFE does not mutate state");

const activated = buildPaiSafeSurfaceProjection({
  transactionRef: "txn_activated_smoke",
  processorEventRef: "processor_evt_activated",
  fundTrackerDecisionRef: "ft_decision_activated",
  activatedTransactionStateRef: "ats_activated",
  processorTransportState: "processor_success",
  fundTrackerVerificationState: "fundtracker_verified",
  activatedTransactionArtifactState: "ats_present"
});

assert(activated.status === "activated", "ATS-present path displays activated");
assert(activated.safeToProceed === true, "Activated display safe to proceed");
assert(activated.downstreamActivationEligible === true, "Activated display downstream eligible");
assert(activated.references.activatedTransactionStateRef === "ats_activated", "ATS reference preserved");
assert(activated.boundary.paiSafeDoesNotCreateActivatedTransactionState === true, "PAI-SAFE does not create ATS");

const harness = runPaiSafePressureHarness();

assert(harness.status === "PAI_SAFE_SURFACE_FAILURE_TAXONOMY_READY", "Pressure harness ready");
assert(harness.scenariosPassed === 10, "Ten pressure scenarios passed");
assert(harness.scenariosFailed === 0, "Zero pressure scenarios failed");
assert(harness.boundary.harnessCreatesNoPaymentAuthority === true, "Harness creates no payment authority");
assert(harness.boundary.harnessCreatesNoTransactionTruth === true, "Harness creates no transaction truth");
assert(harness.boundary.harnessCreatesNoRuntimeActivation === true, "Harness creates no runtime activation");

const requiredScenarios = [
  "processor_success_only",
  "verification_pending",
  "duplicate_detected",
  "partial_payment",
  "race_condition_hold",
  "fundtracker_refused",
  "verified_without_ats",
  "activated",
  "invalid_ats",
  "superseded_ats"
];

for (const scenarioId of requiredScenarios) {
  assert(
    harness.scenarioResults.some((scenario) => scenario.scenarioId === scenarioId && scenario.passed),
    `Scenario passed: ${scenarioId}`
  );
}

console.log("");
console.log("PAI_SAFE_SURFACE_FAILURE_TAXONOMY_SMOKE=PASS");
