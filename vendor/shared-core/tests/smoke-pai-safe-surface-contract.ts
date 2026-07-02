import {
  adaptFundTrackerToPaiSafeSurface,
  buildSampleFundTrackerOutputs,
  PAI_SAFE_SURFACE_CONTRACT_DOCTRINE
} from "../pai-safe-surface-contract";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(PAI_SAFE_SURFACE_CONTRACT_DOCTRINE.boundary.pureAdapterOnly === true, "Doctrine locks pure adapter only");
assert(PAI_SAFE_SURFACE_CONTRACT_DOCTRINE.boundary.noPaymentProcessing === true, "Doctrine locks no payment processing");
assert(PAI_SAFE_SURFACE_CONTRACT_DOCTRINE.boundary.noVerificationLogic === true, "Doctrine locks no verification logic");
assert(PAI_SAFE_SURFACE_CONTRACT_DOCTRINE.boundary.noTransactionMutation === true, "Doctrine locks no transaction mutation");
assert(PAI_SAFE_SURFACE_CONTRACT_DOCTRINE.boundary.noWalletBehavior === true, "Doctrine locks no wallet behavior");
assert(PAI_SAFE_SURFACE_CONTRACT_DOCTRINE.boundary.fundTrackerAIRemainsTruthSource === true, "Doctrine locks FundTrackerAI as truth source");

const processorOnly = adaptFundTrackerToPaiSafeSurface({
  __brand: "FUNDTRACKER_SURFACE_OUTPUT",
  transactionRef: "txn_processor_only_contract",
  processorEventRef: "processor_evt_contract_001",
  processorEventKind: "success",
  fundTrackerDecisionKind: "not_started",
  activatedTransactionStateKind: "absent",
  emittedBy: "FundTrackerAI",
  createdAt: "2026-04-28T00:00:00.000Z"
});

assert(processorOnly.status === "PAI_SAFE_SURFACE_CONTRACT_READY", "Processor-only adapter ready as display contract");
assert(processorOnly.surfaceState.status === "processor_success_not_authority", "Processor success maps to non-authority display");
assert(processorOnly.surfaceState.safeToProceed === false, "Processor-only state not safe to proceed");
assert(processorOnly.surfaceState.downstreamActivationEligible === false, "Processor-only state not downstream eligible");
assert(processorOnly.surfaceState.visualDistinctions.processorSuccessIsAuthority === false, "Processor success not authority");
assert(processorOnly.surfaceState.readOnlyContract.paiSafeHasWritePath === false, "PAI-SAFE has no write path");

const verifiedNoAts = adaptFundTrackerToPaiSafeSurface({
  __brand: "FUNDTRACKER_SURFACE_OUTPUT",
  transactionRef: "txn_verified_no_ats_contract",
  processorEventRef: "processor_evt_contract_002",
  fundTrackerDecisionRef: "ft_decision_contract_002",
  verifiedOpportunityRef: "verified_opp_contract_002",
  processorEventKind: "success",
  fundTrackerDecisionKind: "verified",
  activatedTransactionStateKind: "absent",
  emittedBy: "FundTrackerAI",
  createdAt: "2026-04-28T00:00:01.000Z"
});

assert(verifiedNoAts.surfaceState.status === "governed_safe", "Verified without ATS maps governed safe");
assert(verifiedNoAts.surfaceState.failureClass === "MISSING_ATS", "Verified without ATS preserves missing ATS class");
assert(verifiedNoAts.surfaceState.safeToProceed === true, "Verified without ATS safe to proceed at display level");
assert(verifiedNoAts.surfaceState.downstreamActivationEligible === false, "Verified without ATS not downstream eligible");
assert(verifiedNoAts.surfaceState.sourceRefs.fundTrackerDecisionRef === "ft_decision_contract_002", "FundTracker decision ref preserved");

const activated = adaptFundTrackerToPaiSafeSurface({
  __brand: "FUNDTRACKER_SURFACE_OUTPUT",
  transactionRef: "txn_activated_contract",
  processorEventRef: "processor_evt_contract_003",
  fundTrackerDecisionRef: "ft_decision_contract_003",
  activatedTransactionStateRef: "ats_contract_003",
  verifiedOpportunityRef: "verified_opp_contract_003",
  processorEventKind: "success",
  fundTrackerDecisionKind: "verified",
  activatedTransactionStateKind: "present",
  emittedBy: "FundTrackerAI",
  createdAt: "2026-04-28T00:00:02.000Z"
});

assert(activated.surfaceState.status === "activated", "Activated maps to activated display");
assert(activated.surfaceState.downstreamActivationEligible === true, "Activated display downstream eligible");
assert(activated.surfaceState.sourceRefs.activatedTransactionStateRef === "ats_contract_003", "ATS reference preserved");
assert(activated.surfaceState.boundary.activatedTransactionStateRemainsActivationUnlock === true, "ATS remains activation unlock");

const missingDecisionRef = adaptFundTrackerToPaiSafeSurface({
  __brand: "FUNDTRACKER_SURFACE_OUTPUT",
  transactionRef: "txn_missing_decision_ref",
  processorEventRef: "processor_evt_contract_missing",
  processorEventKind: "success",
  fundTrackerDecisionKind: "verified",
  activatedTransactionStateKind: "absent",
  emittedBy: "FundTrackerAI",
  createdAt: "2026-04-28T00:00:03.000Z"
});

assert(missingDecisionRef.status === "PAI_SAFE_SURFACE_CONTRACT_BLOCKED", "Missing FundTracker decision ref blocks governed confidence");
assert(missingDecisionRef.refusalReasons.includes("FUNDTRACKER_DECISION_REF_REQUIRED"), "FundTracker decision ref required");
assert(missingDecisionRef.surfaceState.safeToProceed === false, "Blocked contract not safe to proceed");

const missingAtsRef = adaptFundTrackerToPaiSafeSurface({
  __brand: "FUNDTRACKER_SURFACE_OUTPUT",
  transactionRef: "txn_missing_ats_ref",
  processorEventRef: "processor_evt_contract_ats_missing",
  fundTrackerDecisionRef: "ft_decision_contract_ats_missing",
  processorEventKind: "success",
  fundTrackerDecisionKind: "verified",
  activatedTransactionStateKind: "present",
  emittedBy: "FundTrackerAI",
  createdAt: "2026-04-28T00:00:04.000Z"
});

assert(missingAtsRef.status === "PAI_SAFE_SURFACE_CONTRACT_BLOCKED", "Missing ATS ref blocks activated display confidence");
assert(missingAtsRef.refusalReasons.includes("ATS_REF_REQUIRED_WHEN_PRESENT"), "ATS ref required when present");
assert(missingAtsRef.surfaceState.downstreamActivationEligible === false, "Missing ATS ref not downstream eligible");

const samples = buildSampleFundTrackerOutputs();
const mapped = samples.map(adaptFundTrackerToPaiSafeSurface);

assert(mapped.length === 7, "Seven sample FundTracker outputs mapped");
assert(mapped.every((result) => result.boundary.contractIsReadOnlyProjection === true), "Every result is read-only projection");
assert(mapped.every((result) => result.boundary.contractCreatesNoPaymentAuthority === true), "No result creates payment authority");
assert(mapped.every((result) => result.boundary.contractCreatesNoTransactionTruth === true), "No result creates transaction truth");
assert(mapped.some((result) => result.surfaceState.status === "duplicate_detected"), "Duplicate sample mapped");
assert(mapped.some((result) => result.surfaceState.status === "partial_payment"), "Partial sample mapped");
assert(mapped.some((result) => result.surfaceState.status === "race_condition_hold"), "Race sample mapped");
assert(mapped.some((result) => result.surfaceState.status === "refused"), "Refused sample mapped");

console.log("");
console.log("PAI_SAFE_SURFACE_CONTRACT_SMOKE=PASS");
