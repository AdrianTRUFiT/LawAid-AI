import {
  buildValidSandboxE2EPayload,
  runSandboxEndToEndTransactionFlow,
  SANDBOX_E2E_TRANSACTION_FLOW_HARNESS_DOCTRINE
} from "../sandbox-e2e-transaction-flow-harness";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(SANDBOX_E2E_TRANSACTION_FLOW_HARNESS_DOCTRINE.boundary.sandboxOnly === true, "Doctrine locks sandbox only");
assert(SANDBOX_E2E_TRANSACTION_FLOW_HARNESS_DOCTRINE.boundary.noLiveRailsCreated === true, "Doctrine creates no live rails");
assert(SANDBOX_E2E_TRANSACTION_FLOW_HARNESS_DOCTRINE.boundary.noLivePaymentProcessingCreated === true, "Doctrine creates no live payment processing");
assert(SANDBOX_E2E_TRANSACTION_FLOW_HARNESS_DOCTRINE.boundary.noLiveTransactionTruthCreated === true, "Doctrine creates no live transaction truth");
assert(SANDBOX_E2E_TRANSACTION_FLOW_HARNESS_DOCTRINE.boundary.noLiveATSCreated === true, "Doctrine creates no live ATS");
assert(SANDBOX_E2E_TRANSACTION_FLOW_HARNESS_DOCTRINE.boundary.noCustodyTransferCreated === true, "Doctrine creates no custody transfer");
assert(SANDBOX_E2E_TRANSACTION_FLOW_HARNESS_DOCTRINE.boundary.noRuntimeActivationCreated === true, "Doctrine creates no runtime activation");
assert(SANDBOX_E2E_TRANSACTION_FLOW_HARNESS_DOCTRINE.boundary.paiSafeIsDisplayOnly === true, "Doctrine locks PAI-SAFE as display only");
assert(SANDBOX_E2E_TRANSACTION_FLOW_HARNESS_DOCTRINE.boundary.uiIsDisplayOnly === true, "Doctrine locks UI as display only");

const successPayload = buildValidSandboxE2EPayload("e2e_success_001");
const success = runSandboxEndToEndTransactionFlow(successPayload);

assert(success.status === "SANDBOX_E2E_TRANSACTION_FLOW_READY", "E2E success flow ready");
assert(success.intake.status === "SANDBOX_RAIL_ADAPTER_ACCEPTED", "E2E intake accepted");
assert(success.fundTrackerVerification?.status === "SANDBOX_TRANSACTION_MUTATION_APPLIED", "E2E FundTracker verification applied");
assert(success.sandboxAtsEmission?.status === "SANDBOX_ATS_EMITTED", "E2E sandbox ATS emitted");
assert(success.sandboxAts?.sandboxOnly === true, "E2E ATS sandbox only");
assert(success.sandboxAts?.liveAts === false, "E2E ATS not live");
assert(success.paiSafeSurface?.status === "PAI_SAFE_SURFACE_CONTRACT_READY", "E2E PAI-SAFE surface ready");
assert(success.paiSafeSurface?.surfaceState.status === "activated", "E2E PAI-SAFE surface activated");
assert(success.paiSafeUi?.status === "PAI_SAFE_UI_STATE_MAPPING_READY", "E2E PAI-SAFE UI ready");
assert(success.paiSafeUi?.displayState.headline === "Activated", "E2E UI headline activated");
assert(success.paiSafeUi?.displayState.showDownstreamUnlock === true, "E2E UI shows downstream unlock");
assert(typeof success.proofChain.sandboxProcessorEventRef === "string", "E2E proof includes sandbox processor event ref");
assert(typeof success.proofChain.verifiedOpportunityRef === "string", "E2E proof includes verified opportunity ref");
assert(typeof success.proofChain.fundTrackerDecisionRef === "string", "E2E proof includes FundTracker decision ref");
assert(typeof success.proofChain.sandboxAtsRef === "string", "E2E proof includes sandbox ATS ref");
assert(typeof success.proofChain.paiSafeContractId === "string", "E2E proof includes PAI-SAFE contract id");
assert(typeof success.proofChain.paiSafeDisplayId === "string", "E2E proof includes PAI-SAFE display id");

const livePayload = {
  ...buildValidSandboxE2EPayload("e2e_live_refused"),
  provider: "STRIPE_LIVE" as const,
  sandboxOnly: false,
  liveRail: true,
  livePayment: true
};

const liveRefused = runSandboxEndToEndTransactionFlow(livePayload);

assert(liveRefused.status === "SANDBOX_E2E_TRANSACTION_FLOW_REFUSED", "E2E live payload refused");
assert(liveRefused.refusalCodes.includes("INTAKE_REFUSED"), "E2E live refusal occurs at intake");
assert(liveRefused.intake.refusalCodes.includes("LIVE_RAIL_PAYLOAD_REFUSED"), "E2E live rail refused");
assert(liveRefused.intake.refusalCodes.includes("LIVE_PAYMENT_PAYLOAD_REFUSED"), "E2E live payment refused");
assert(liveRefused.fundTrackerVerification === undefined, "E2E live refusal does not reach FundTrackerAI");
assert(liveRefused.sandboxAtsEmission === undefined, "E2E live refusal does not emit ATS");

const partialPayload = {
  ...buildValidSandboxE2EPayload("e2e_partial_refused"),
  rawEventKind: "payment_intent.partial" as const
};

const partialRefused = runSandboxEndToEndTransactionFlow(partialPayload);

assert(partialRefused.status === "SANDBOX_E2E_TRANSACTION_FLOW_REFUSED", "E2E partial payload refused");
assert(partialRefused.refusalCodes.includes("FUNDTRACKER_VERIFY_REFUSED"), "E2E partial refusal occurs at FundTrackerAI");
assert(partialRefused.fundTrackerVerification?.refusalCodes.includes("PARTIAL_PAYMENT_REFUSED") === true, "E2E partial refusal code preserved");
assert(partialRefused.sandboxAtsEmission === undefined, "E2E partial refusal does not emit ATS");
assert(partialRefused.paiSafeSurface === undefined, "E2E partial refusal does not map PAI-SAFE surface");

const stalePayload = {
  ...buildValidSandboxE2EPayload("e2e_stale_refused"),
  rawEventKind: "payment_intent.stale" as const
};

const staleRefused = runSandboxEndToEndTransactionFlow(stalePayload);

assert(staleRefused.status === "SANDBOX_E2E_TRANSACTION_FLOW_REFUSED", "E2E stale payload refused");
assert(staleRefused.fundTrackerVerification?.refusalCodes.includes("STALE_EVENT_REFUSED") === true, "E2E stale refusal code preserved");

const mutationAttemptPayload = {
  ...buildValidSandboxE2EPayload("e2e_mutation_attempt_refused"),
  attemptsToMutateState: true,
  attemptsToCreateATS: true,
  attemptsToProcessPayment: true
};

const mutationRefused = runSandboxEndToEndTransactionFlow(mutationAttemptPayload);

assert(mutationRefused.status === "SANDBOX_E2E_TRANSACTION_FLOW_REFUSED", "E2E mutation/ATS/payment attempt refused");
assert(mutationRefused.refusalCodes.includes("INTAKE_REFUSED"), "E2E mutation attempt refused at intake");
assert(mutationRefused.intake.refusalCodes.includes("PAYLOAD_CANNOT_MUTATE_STATE"), "E2E mutation attempt code preserved");
assert(mutationRefused.intake.refusalCodes.includes("PAYLOAD_CANNOT_CREATE_ATS"), "E2E ATS attempt code preserved");
assert(mutationRefused.intake.refusalCodes.includes("PAYLOAD_CANNOT_PROCESS_PAYMENT"), "E2E payment attempt code preserved");

const noLiveLeak =
  success.boundary.e2eCreatesNoLiveRails === true &&
  success.boundary.e2eCreatesNoLivePaymentProcessing === true &&
  success.boundary.e2eCreatesNoLiveTransactionTruth === true &&
  success.boundary.e2eCreatesNoLiveATS === true &&
  success.boundary.e2eCreatesNoCustodyTransfer === true &&
  success.boundary.e2eCreatesNoRuntimeActivation === true &&
  success.boundary.paiSafeIsDisplayOnly === true &&
  success.boundary.uiIsDisplayOnly === true;

assert(noLiveLeak === true, "No live capability leaked from E2E sandbox flow");

console.log("");
console.log("SANDBOX_E2E_TRANSACTION_FLOW_HARNESS_SMOKE=PASS");
