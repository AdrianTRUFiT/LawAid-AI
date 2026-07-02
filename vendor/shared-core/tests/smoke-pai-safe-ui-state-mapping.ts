import {
  mapPaiSafeContractToConsumerDisplay,
  PAI_SAFE_UI_STATE_MAPPING_DOCTRINE
} from "../pai-safe-ui-state-mapping";

import {
  adaptFundTrackerToPaiSafeSurface
} from "../pai-safe-surface-contract";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(PAI_SAFE_UI_STATE_MAPPING_DOCTRINE.boundary.uiIsDisplayOnly === true, "Doctrine locks UI as display only");
assert(PAI_SAFE_UI_STATE_MAPPING_DOCTRINE.boundary.displayIsNotAuthority === true, "Doctrine locks display is not authority");
assert(PAI_SAFE_UI_STATE_MAPPING_DOCTRINE.boundary.noPaymentProcessing === true, "Doctrine locks no payment processing");
assert(PAI_SAFE_UI_STATE_MAPPING_DOCTRINE.boundary.noTransactionMutation === true, "Doctrine locks no transaction mutation");
assert(PAI_SAFE_UI_STATE_MAPPING_DOCTRINE.boundary.noATSGeneration === true, "Doctrine locks no ATS generation");
assert(PAI_SAFE_UI_STATE_MAPPING_DOCTRINE.boundary.noWalletBehavior === true, "Doctrine locks no wallet behavior");

const processorOnlyContract = adaptFundTrackerToPaiSafeSurface({
  __brand: "FUNDTRACKER_SURFACE_OUTPUT",
  transactionRef: "ui_processor_only",
  processorEventRef: "processor_evt_ui_001",
  processorEventKind: "success",
  fundTrackerDecisionKind: "not_started",
  activatedTransactionStateKind: "absent",
  emittedBy: "FundTrackerAI",
  createdAt: "2026-04-28T00:00:00.000Z"
});

const processorOnlyUi = mapPaiSafeContractToConsumerDisplay(processorOnlyContract.surfaceState);

assert(processorOnlyUi.status === "PAI_SAFE_UI_STATE_MAPPING_READY", "Processor-only UI mapping ready");
assert(processorOnlyUi.displayState.headline === "Payment event received", "Processor-only headline correct");
assert(processorOnlyUi.displayState.tone === "warning", "Processor-only tone warning");
assert(processorOnlyUi.displayState.showProceedAffordance === false, "Processor-only no proceed affordance");
assert(processorOnlyUi.displayState.lanes.processor.authority === false, "Processor lane is not authority");
assert(processorOnlyUi.displayState.lanes.fundTracker.authority === true, "FundTracker lane marked truth source authority");
assert(processorOnlyUi.displayState.boundary.uiDoesNotCreatePaymentAuthority === true, "UI creates no payment authority");

const governedSafeContract = adaptFundTrackerToPaiSafeSurface({
  __brand: "FUNDTRACKER_SURFACE_OUTPUT",
  transactionRef: "ui_governed_safe",
  processorEventRef: "processor_evt_ui_002",
  fundTrackerDecisionRef: "ft_decision_ui_002",
  verifiedOpportunityRef: "verified_opp_ui_002",
  processorEventKind: "success",
  fundTrackerDecisionKind: "verified",
  activatedTransactionStateKind: "absent",
  emittedBy: "FundTrackerAI",
  createdAt: "2026-04-28T00:00:01.000Z"
});

const governedSafeUi = mapPaiSafeContractToConsumerDisplay(governedSafeContract.surfaceState);

assert(governedSafeUi.displayState.headline === "Governed safe", "Governed safe headline correct");
assert(governedSafeUi.displayState.tone === "safe", "Governed safe tone safe");
assert(governedSafeUi.displayState.showProceedAffordance === true, "Governed safe can show proceed affordance");
assert(governedSafeUi.displayState.showDownstreamUnlock === false, "Governed safe without ATS does not show downstream unlock");

const activatedContract = adaptFundTrackerToPaiSafeSurface({
  __brand: "FUNDTRACKER_SURFACE_OUTPUT",
  transactionRef: "ui_activated",
  processorEventRef: "processor_evt_ui_003",
  fundTrackerDecisionRef: "ft_decision_ui_003",
  activatedTransactionStateRef: "ats_ui_003",
  verifiedOpportunityRef: "verified_opp_ui_003",
  processorEventKind: "success",
  fundTrackerDecisionKind: "verified",
  activatedTransactionStateKind: "present",
  emittedBy: "FundTrackerAI",
  createdAt: "2026-04-28T00:00:02.000Z"
});

const activatedUi = mapPaiSafeContractToConsumerDisplay(activatedContract.surfaceState);

assert(activatedUi.displayState.headline === "Activated", "Activated headline correct");
assert(activatedUi.displayState.tone === "activated", "Activated tone correct");
assert(activatedUi.displayState.showProceedAffordance === true, "Activated shows proceed affordance");
assert(activatedUi.displayState.showDownstreamUnlock === true, "Activated shows downstream unlock");
assert(activatedUi.displayState.lanes.activatedTransactionState.unlockArtifact === true, "ATS lane shows unlock artifact");
assert(activatedUi.displayState.boundary.uiDoesNotCreateATS === true, "UI does not create ATS");

const refusedContract = adaptFundTrackerToPaiSafeSurface({
  __brand: "FUNDTRACKER_SURFACE_OUTPUT",
  transactionRef: "ui_refused",
  processorEventRef: "processor_evt_ui_refused",
  fundTrackerDecisionRef: "ft_decision_ui_refused",
  processorEventKind: "success",
  fundTrackerDecisionKind: "refused",
  activatedTransactionStateKind: "absent",
  emittedBy: "FundTrackerAI",
  createdAt: "2026-04-28T00:00:03.000Z"
});

const refusedUi = mapPaiSafeContractToConsumerDisplay(refusedContract.surfaceState);

assert(refusedUi.displayState.headline === "Transaction refused", "Refused headline correct");
assert(refusedUi.displayState.severity === "BLOCKING", "Refused severity blocking");
assert(refusedUi.displayState.primaryAction === "contact_support", "Refused primary action contact support");
assert(refusedUi.displayState.showProceedAffordance === false, "Refused shows no proceed");

const duplicateContract = adaptFundTrackerToPaiSafeSurface({
  __brand: "FUNDTRACKER_SURFACE_OUTPUT",
  transactionRef: "ui_duplicate",
  processorEventRef: "processor_evt_ui_duplicate",
  fundTrackerDecisionRef: "ft_decision_ui_duplicate",
  processorEventKind: "duplicate",
  fundTrackerDecisionKind: "duplicate_detected",
  activatedTransactionStateKind: "duplicate_refused",
  emittedBy: "FundTrackerAI",
  createdAt: "2026-04-28T00:00:04.000Z"
});

const duplicateUi = mapPaiSafeContractToConsumerDisplay(duplicateContract.surfaceState);

assert(duplicateUi.displayState.headline === "Duplicate detected", "Duplicate headline correct");
assert(duplicateUi.displayState.tone === "warning", "Duplicate tone warning");
assert(duplicateUi.displayState.showProceedAffordance === false, "Duplicate shows no proceed");

const allUiBoundariesHold =
  processorOnlyUi.boundary.mappingCreatesNoPaymentAuthority === true &&
  governedSafeUi.boundary.mappingCreatesNoTransactionTruth === true &&
  activatedUi.boundary.mappingCreatesNoRuntimeActivation === true &&
  refusedUi.displayState.boundary.uiDoesNotCreateWalletBehavior === true &&
  duplicateUi.displayState.boundary.displayIsNotAuthority === true;

assert(allUiBoundariesHold === true, "All UI mapping boundaries hold");

console.log("");
console.log("PAI_SAFE_UI_STATE_MAPPING_SMOKE=PASS");
