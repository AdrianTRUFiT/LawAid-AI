import {
  buildControlledReplayScenarios,
  CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_DOCTRINE,
  runControlledReplayScenario,
  runControlledSandboxTransactionReplaySuite,
  summarizeControlledReplayResults
} from "../controlled-sandbox-transaction-replay-suite";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

assert(CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_DOCTRINE.boundary.sandboxOnly === true, "Doctrine locks sandbox only");
assert(CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_DOCTRINE.boundary.replayIsTestOnly === true, "Doctrine locks replay as test only");
assert(CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_DOCTRINE.boundary.noLiveRailsCreated === true, "Doctrine creates no live rails");
assert(CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_DOCTRINE.boundary.noLivePaymentProcessingCreated === true, "Doctrine creates no live payment processing");
assert(CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_DOCTRINE.boundary.noLiveTransactionTruthCreated === true, "Doctrine creates no live truth");
assert(CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_DOCTRINE.boundary.noLiveATSCreated === true, "Doctrine creates no live ATS");
assert(CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_DOCTRINE.boundary.noRuntimeActivationCreated === true, "Doctrine creates no runtime activation");
assert(CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_DOCTRINE.boundary.notLaunchApproval === true, "Doctrine blocks launch approval");

const scenarios = buildControlledReplayScenarios();

assert(scenarios.length === 13, "Replay scenario set has 13 cases");
assert(scenarios.filter((scenario) => scenario.expectedOutcome === "READY").length === 2, "Replay suite has two valid ready scenarios");
assert(scenarios.some((scenario) => scenario.kind === "LIVE_RAIL_ATTEMPT"), "Replay suite includes live rail attempt");
assert(scenarios.some((scenario) => scenario.kind === "MUTATION_ATTEMPT"), "Replay suite includes mutation attempt");
assert(scenarios.some((scenario) => scenario.kind === "TAMPERED_LEDGER_CHAIN"), "Replay suite includes tampered ledger chain");

const validScenario = scenarios.find((scenario) => scenario.scenarioId === "scenario_valid_001");
if (!validScenario) throw new Error("ASSERTION_FAILED: valid scenario exists");

const validResult = runControlledReplayScenario(validScenario);

assert(validResult.passed === true, "Single valid replay scenario passes");
assert(validResult.observedOutcome === "READY", "Single valid replay scenario ready");
assert(validResult.trustSpineResult.status === "SANDBOX_TRUST_SPINE_CONSOLIDATION_READY", "Valid replay trust spine ready");
assert(validResult.boundary.replayCreatesNoLiveRails === true, "Valid replay creates no live rails");

const liveScenario = scenarios.find((scenario) => scenario.kind === "LIVE_RAIL_ATTEMPT");
if (!liveScenario) throw new Error("ASSERTION_FAILED: live scenario exists");

const liveResult = runControlledReplayScenario(liveScenario);

assert(liveResult.passed === true, "Live rail replay scenario passes by refusal");
assert(liveResult.observedOutcome === "REFUSED", "Live rail replay refused");
assert(liveResult.trustSpineResult.status === "SANDBOX_TRUST_SPINE_CONSOLIDATION_REFUSED", "Live rail trust spine refused");

const mutationScenario = scenarios.find((scenario) => scenario.kind === "MUTATION_ATTEMPT");
if (!mutationScenario) throw new Error("ASSERTION_FAILED: mutation scenario exists");

const mutationResult = runControlledReplayScenario(mutationScenario);

assert(mutationResult.passed === true, "Mutation replay scenario passes by refusal");
assert(mutationResult.observedOutcome === "REFUSED", "Mutation replay refused");

const tamperScenario = scenarios.find((scenario) => scenario.kind === "TAMPERED_LEDGER_CHAIN");
if (!tamperScenario) throw new Error("ASSERTION_FAILED: tamper scenario exists");

const tamperResult = runControlledReplayScenario(tamperScenario, validResult.ledgerRecord);

assert(tamperResult.passed === true, "Tampered ledger replay scenario passes by chain refusal");
assert(tamperResult.observedOutcome === "CHAIN_REFUSED", "Tampered ledger chain refused");
assert(tamperResult.ledgerChainValid === false, "Tampered ledger chain invalid");

const suite = runControlledSandboxTransactionReplaySuite();

if (suite.status !== "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_READY") {
  console.log("REPLAY_SUITE_DIAGNOSTICS", JSON.stringify({
    status: suite.status,
    summary: suite.summary,
    refusalCodes: suite.refusalCodes,
    scenarioResults: suite.scenarioResults.map((result) => ({
      scenarioId: result.scenarioId,
      kind: result.kind,
      expectedOutcome: result.expectedOutcome,
      observedOutcome: result.observedOutcome,
      passed: result.passed,
      ledgerChainValid: result.ledgerChainValid,
      refusalCodes: result.refusalCodes,
      trustSpineStatus: result.trustSpineResult.status
    }))
  }, null, 2));
}

assert(suite.status === "CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_READY", "Controlled replay suite ready");
assert(suite.scenarioResults.length === 13, "Suite result includes 13 scenario results");
assert(suite.summary.total === 13, "Suite summary total 13");
assert(suite.summary.passed === 13, "Suite summary all passed");
assert(suite.summary.failed === 0, "Suite summary zero failed");
assert(suite.summary.score === 100, "Suite score 100");
assert(suite.summary.validReadyCount === 2, "Suite has two ready valid scenarios");
assert(suite.summary.liveAttemptsRefused === 1, "Suite refused one live attempt");
assert(suite.summary.mutationAttemptsRefused === 1, "Suite refused one mutation attempt");
assert(suite.summary.missingRefAttemptsRefused === 3, "Suite refused three missing-ref attempts");
assert(suite.summary.chainRefusedCount === 1, "Suite refused one tampered chain");
assert(suite.refusalCodes.length === 0, "Suite has no suite-level refusal codes");

const allScenarioBoundariesHold = suite.scenarioResults.every(
  (result) =>
    result.boundary.replayCreatesNoLiveRails === true &&
    result.boundary.replayCreatesNoLivePaymentProcessing === true &&
    result.boundary.replayCreatesNoLiveTransactionTruth === true &&
    result.boundary.replayCreatesNoLiveATS === true &&
    result.boundary.replayCreatesNoRuntimeActivation === true
);

assert(allScenarioBoundariesHold === true, "All replay scenario boundaries hold");

const noLiveLeak =
  suite.boundary.noLiveRailsCreated === true &&
  suite.boundary.noLivePaymentProcessingCreated === true &&
  suite.boundary.noLiveTransactionTruthCreated === true &&
  suite.boundary.noLiveATSCreated === true &&
  suite.boundary.noCustodyTransferCreated === true &&
  suite.boundary.noRuntimeActivationCreated === true &&
  suite.boundary.replaySuiteIsNotLaunchApproval === true;

assert(noLiveLeak === true, "No live capability leaked from controlled replay suite");

const emptySummary = summarizeControlledReplayResults([]);

assert(emptySummary.refusalCodes.includes("REPLAY_BATCH_EMPTY"), "Empty summary refuses empty batch");
assert(emptySummary.refusalCodes.includes("SUMMARY_SCORE_BELOW_THRESHOLD"), "Empty summary score below threshold");

console.log("");
console.log("CONTROLLED_SANDBOX_TRANSACTION_REPLAY_SUITE_SMOKE=PASS");

