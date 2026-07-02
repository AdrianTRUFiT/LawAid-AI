import {
  buildSandboxProcessorSuccessEvent,
  buildSandboxVerifiedOpportunity,
  evaluateSandboxTransactionAuthority,
  FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY_DOCTRINE
} from "../fundtrackerai-sandbox-transaction-authority";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY_DOCTRINE.boundary.sandboxOnly === true, "Doctrine locks sandbox only");
assert(FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY_DOCTRINE.boundary.fundTrackerAIIsTruthAuthority === true, "Doctrine locks FundTrackerAI as truth authority");
assert(FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY_DOCTRINE.boundary.processorEventIsNotAuthority === true, "Doctrine locks processor event as non-authority");
assert(FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY_DOCTRINE.boundary.noLiveRailsCreated === true, "Doctrine creates no live rails");
assert(FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY_DOCTRINE.boundary.noLivePaymentProcessingCreated === true, "Doctrine creates no live payment processing");
assert(FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY_DOCTRINE.boundary.noLiveATSCreated === true, "Doctrine creates no live ATS");
assert(FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY_DOCTRINE.boundary.gtisHasNoWriteAuthority === true, "Doctrine blocks GTIS write authority");
assert(FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY_DOCTRINE.boundary.paiSafeHasNoAuthority === true, "Doctrine blocks PAI-SAFE authority");

const transactionRef = "sandbox_txn_001";
const now = "2026-04-28T00:05:00.000Z";
const processorEvent = buildSandboxProcessorSuccessEvent(transactionRef);
const verifiedOpportunity = buildSandboxVerifiedOpportunity(transactionRef);

const verifyResult = evaluateSandboxTransactionAuthority({
  actor: "FundTrackerAI",
  now,
  verifiedOpportunity,
  processorEvent,
  requestedDecision: "VERIFY_SANDBOX_COMMITMENT"
});

assert(verifyResult.status === "SANDBOX_TRANSACTION_MUTATION_APPLIED", "Sandbox verification mutation applied");
assert(verifyResult.record.status === "SANDBOX_TRANSACTION_VERIFIED", "Sandbox transaction verified");
assert(verifyResult.record.processorEventRef === processorEvent.eventRef, "Processor event ref preserved");
assert(verifyResult.record.verifiedOpportunityRef === verifiedOpportunity.verifiedOpportunityRef, "Verified opportunity ref preserved");
assert(verifyResult.record.boundary.processorEventIsNotAuthority === true, "Processor event remains non-authority");
assert(verifyResult.boundary.resultCreatesNoLiveRails === true, "Verification creates no live rails");
assert(verifyResult.boundary.resultCreatesNoLiveTransactionTruth === true, "Verification creates no live transaction truth");

const atsResult = evaluateSandboxTransactionAuthority({
  actor: "FundTrackerAI",
  now: "2026-04-28T00:06:00.000Z",
  existingRecord: verifyResult.record,
  verifiedOpportunity,
  processorEvent: {
    ...processorEvent,
    replayNonce: "nonce_sandbox_txn_001_ats"
  },
  requestedDecision: "EMIT_SANDBOX_ATS"
});

assert(atsResult.status === "SANDBOX_ATS_EMITTED", "Sandbox ATS emitted");
assert(atsResult.record.status === "SANDBOX_TRANSACTION_ACTIVATED", "Sandbox transaction activated");
assert(atsResult.emittedATS?.sandboxOnly === true, "Emitted ATS sandbox only");
assert(atsResult.emittedATS?.liveAts === false, "Emitted ATS is not live ATS");
assert(atsResult.emittedATS?.emittedBy === "FundTrackerAI", "Sandbox ATS emitted by FundTrackerAI");
assert(atsResult.boundary.resultCreatesNoLiveATS === true, "ATS emission creates no live ATS");
assert(atsResult.boundary.resultCreatesNoRuntimeActivation === true, "ATS emission creates no runtime activation");

const duplicateAts = evaluateSandboxTransactionAuthority({
  actor: "FundTrackerAI",
  now: "2026-04-28T00:07:00.000Z",
  existingRecord: atsResult.record,
  verifiedOpportunity,
  processorEvent: {
    ...processorEvent,
    replayNonce: "nonce_sandbox_txn_001_second_ats"
  },
  requestedDecision: "EMIT_SANDBOX_ATS"
});

assert(duplicateAts.status === "SANDBOX_ATS_REFUSED", "Duplicate ATS emission refused");
assert(duplicateAts.refusalCodes.includes("ATS_ALREADY_EMITTED"), "ATS already emitted refusal present");

const gtisAttempt = evaluateSandboxTransactionAuthority({
  actor: "GTIS",
  now,
  verifiedOpportunity,
  processorEvent: buildSandboxProcessorSuccessEvent("sandbox_txn_gtis_attempt"),
  requestedDecision: "VERIFY_SANDBOX_COMMITMENT"
});

assert(gtisAttempt.status === "SANDBOX_TRANSACTION_MUTATION_REFUSED", "GTIS mutation attempt refused");
assert(gtisAttempt.refusalCodes.includes("ATS_REQUIRES_FUNDTRACKER_ACTOR"), "Non-FundTracker actor refused");
assert(gtisAttempt.record.boundary.gtisHasNoWriteAuthority === true, "GTIS still has no write authority");

const partialEvent = {
  ...buildSandboxProcessorSuccessEvent("sandbox_txn_partial"),
  eventKind: "SANDBOX_PROCESSOR_EVENT_PARTIAL" as const,
  replayNonce: "nonce_partial"
};

const partialResult = evaluateSandboxTransactionAuthority({
  actor: "FundTrackerAI",
  now,
  verifiedOpportunity: buildSandboxVerifiedOpportunity("sandbox_txn_partial"),
  processorEvent: partialEvent,
  requestedDecision: "VERIFY_SANDBOX_COMMITMENT"
});

assert(partialResult.status === "SANDBOX_TRANSACTION_MUTATION_REFUSED", "Partial payment refused");
assert(partialResult.refusalCodes.includes("PARTIAL_PAYMENT_REFUSED"), "Partial payment refusal present");

const replayResult = evaluateSandboxTransactionAuthority({
  actor: "FundTrackerAI",
  now: "2026-04-28T00:08:00.000Z",
  existingRecord: verifyResult.record,
  verifiedOpportunity,
  processorEvent,
  requestedDecision: "VERIFY_SANDBOX_COMMITMENT"
});

assert(replayResult.status === "SANDBOX_TRANSACTION_MUTATION_REFUSED", "Replay event refused");
assert(replayResult.refusalCodes.includes("REPLAY_EVENT_REFUSED"), "Replay refusal present");

const staleResult = evaluateSandboxTransactionAuthority({
  actor: "FundTrackerAI",
  now: "2026-04-28T02:00:00.000Z",
  verifiedOpportunity: buildSandboxVerifiedOpportunity("sandbox_txn_stale"),
  processorEvent: buildSandboxProcessorSuccessEvent("sandbox_txn_stale"),
  requestedDecision: "VERIFY_SANDBOX_COMMITMENT"
});

assert(staleResult.status === "SANDBOX_TRANSACTION_MUTATION_REFUSED", "Stale event refused");
assert(staleResult.refusalCodes.includes("STALE_EVENT_REFUSED"), "Stale refusal present");

const noLiveLeak =
  verifyResult.boundary.resultCreatesNoLiveRails === true &&
  atsResult.boundary.resultCreatesNoLivePaymentProcessing === true &&
  atsResult.boundary.resultCreatesNoLiveTransactionTruth === true &&
  atsResult.boundary.resultCreatesNoLiveATS === true &&
  atsResult.boundary.resultCreatesNoRuntimeActivation === true;

assert(noLiveLeak === true, "No live capability leaked from sandbox authority");

console.log("");
console.log("FUNDTRACKERAI_SANDBOX_TRANSACTION_AUTHORITY_SMOKE=PASS");
