import {
  adaptSandboxRailPayload,
  buildValidStripeSandboxPayload,
  runSandboxRailAdapterHarness,
  SANDBOX_RAIL_ADAPTER_HARNESS_DOCTRINE
} from "../sandbox-rail-adapter-harness";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(SANDBOX_RAIL_ADAPTER_HARNESS_DOCTRINE.boundary.adapterIsIntakeOnly === true, "Doctrine locks adapter as intake only");
assert(SANDBOX_RAIL_ADAPTER_HARNESS_DOCTRINE.boundary.sandboxOnly === true, "Doctrine locks sandbox only");
assert(SANDBOX_RAIL_ADAPTER_HARNESS_DOCTRINE.boundary.noLiveRailsCreated === true, "Doctrine creates no live rails");
assert(SANDBOX_RAIL_ADAPTER_HARNESS_DOCTRINE.boundary.noLivePaymentProcessingCreated === true, "Doctrine creates no live payment processing");
assert(SANDBOX_RAIL_ADAPTER_HARNESS_DOCTRINE.boundary.noTransactionTruthCreated === true, "Doctrine creates no transaction truth");
assert(SANDBOX_RAIL_ADAPTER_HARNESS_DOCTRINE.boundary.noTransactionMutationCreated === true, "Doctrine creates no mutation");
assert(SANDBOX_RAIL_ADAPTER_HARNESS_DOCTRINE.boundary.noATSCreated === true, "Doctrine creates no ATS");
assert(SANDBOX_RAIL_ADAPTER_HARNESS_DOCTRINE.boundary.fundTrackerAIStillEvaluatesTruth === true, "FundTrackerAI still evaluates truth");

const validPayload = buildValidStripeSandboxPayload("adapter_txn_001");
const accepted = adaptSandboxRailPayload(validPayload);

assert(accepted.status === "SANDBOX_RAIL_ADAPTER_ACCEPTED", "Valid sandbox payload accepted");
assert(accepted.acceptedEvent?.normalizedEvent.eventKind === "SANDBOX_PROCESSOR_EVENT_SUCCESS", "Success event normalized");
assert(accepted.acceptedEvent?.normalizedEvent.sandboxOnly === true, "Normalized event sandbox only");
assert(accepted.acceptedEvent?.normalizedEvent.liveRail === false, "Normalized event not live rail");
assert(accepted.acceptedEvent?.normalizedEvent.livePayment === false, "Normalized event not live payment");
assert(accepted.acceptedEvent?.boundary.adapterDoesNotMutateFundTrackerState === true, "Adapter does not mutate FundTracker");
assert(accepted.acceptedEvent?.boundary.adapterDoesNotEmitATS === true, "Adapter does not emit ATS");
assert(accepted.boundary.adapterCreatesNoTransactionTruth === true, "Adapter creates no transaction truth");

const harness = runSandboxRailAdapterHarness(validPayload);

assert(harness.status === "SANDBOX_RAIL_ADAPTER_HARNESS_READY", "Harness ready for valid sandbox payload");
assert(harness.fundTrackerHandoff?.status === "SANDBOX_TRANSACTION_MUTATION_APPLIED", "FundTrackerAI handoff applies sandbox verification");
assert(harness.boundary.harnessDoesNotBypassFundTrackerAI === true, "Harness does not bypass FundTrackerAI");
assert(harness.boundary.harnessDoesNotEmitATSDirectly === true, "Harness does not emit ATS directly");
assert(harness.boundary.harnessCreatesNoLiveRails === true, "Harness creates no live rails");

const livePayload = {
  ...buildValidStripeSandboxPayload("adapter_txn_live"),
  provider: "STRIPE_LIVE" as const,
  sandboxOnly: false,
  liveRail: true,
  livePayment: true
};

const liveRefused = adaptSandboxRailPayload(livePayload);

assert(liveRefused.status === "SANDBOX_RAIL_ADAPTER_REFUSED", "Live payload refused");
assert(liveRefused.refusalCodes.includes("NON_SANDBOX_PROVIDER_REFUSED"), "Non-sandbox provider refused");
assert(liveRefused.refusalCodes.includes("LIVE_RAIL_PAYLOAD_REFUSED"), "Live rail payload refused");
assert(liveRefused.refusalCodes.includes("LIVE_PAYMENT_PAYLOAD_REFUSED"), "Live payment payload refused");

const mutationAttempt = adaptSandboxRailPayload({
  ...buildValidStripeSandboxPayload("adapter_txn_mutation_attempt"),
  attemptsToMutateState: true,
  attemptsToCreateATS: true,
  attemptsToProcessPayment: true
});

assert(mutationAttempt.status === "SANDBOX_RAIL_ADAPTER_REFUSED", "Mutation/payment/ATS attempt refused");
assert(mutationAttempt.refusalCodes.includes("PAYLOAD_CANNOT_MUTATE_STATE"), "Payload cannot mutate state");
assert(mutationAttempt.refusalCodes.includes("PAYLOAD_CANNOT_CREATE_ATS"), "Payload cannot create ATS");
assert(mutationAttempt.refusalCodes.includes("PAYLOAD_CANNOT_PROCESS_PAYMENT"), "Payload cannot process payment");

const malformed = adaptSandboxRailPayload({
  __brand: "RAW_SANDBOX_RAIL_PAYLOAD",
  provider: "STRIPE_SANDBOX",
  rawEventKind: "unknown",
  sandboxOnly: true,
  liveRail: false,
  livePayment: false
});

assert(malformed.status === "SANDBOX_RAIL_ADAPTER_REFUSED", "Malformed payload refused");
assert(malformed.refusalCodes.includes("MISSING_TRANSACTION_REF"), "Missing transaction ref refused");
assert(malformed.refusalCodes.includes("MISSING_EVENT_REF"), "Missing event ref refused");
assert(malformed.refusalCodes.includes("MISSING_REPLAY_NONCE"), "Missing replay nonce refused");
assert(malformed.refusalCodes.includes("MISSING_AMOUNT"), "Missing amount refused");
assert(malformed.refusalCodes.includes("UNSUPPORTED_CURRENCY"), "Unsupported currency refused");
assert(malformed.refusalCodes.includes("MALFORMED_TIMESTAMP"), "Malformed timestamp refused");
assert(malformed.refusalCodes.includes("UNKNOWN_EVENT_KIND_REFUSED"), "Unknown event kind refused");

const partial = adaptSandboxRailPayload({
  ...buildValidStripeSandboxPayload("adapter_txn_partial"),
  rawEventKind: "payment_intent.partial"
});

assert(partial.status === "SANDBOX_RAIL_ADAPTER_ACCEPTED", "Partial event can be normalized for FundTrackerAI refusal path");
assert(partial.acceptedEvent?.normalizedEvent.eventKind === "SANDBOX_PROCESSOR_EVENT_PARTIAL", "Partial event normalized");

const stale = adaptSandboxRailPayload({
  ...buildValidStripeSandboxPayload("adapter_txn_stale"),
  rawEventKind: "payment_intent.stale"
});

assert(stale.status === "SANDBOX_RAIL_ADAPTER_ACCEPTED", "Stale event can be normalized for FundTrackerAI refusal path");
assert(stale.acceptedEvent?.normalizedEvent.eventKind === "SANDBOX_PROCESSOR_EVENT_STALE", "Stale event normalized");

const noLiveLeak =
  accepted.boundary.adapterCreatesNoLiveRails === true &&
  accepted.boundary.adapterCreatesNoLivePaymentProcessing === true &&
  accepted.boundary.adapterCreatesNoTransactionTruth === true &&
  accepted.boundary.adapterCreatesNoTransactionMutation === true &&
  accepted.boundary.adapterCreatesNoATS === true &&
  harness.boundary.harnessCreatesNoLiveTransactionTruth === true;

assert(noLiveLeak === true, "No live capability leaked from sandbox rail adapter");

console.log("");
console.log("SANDBOX_RAIL_ADAPTER_HARNESS_SMOKE=PASS");
