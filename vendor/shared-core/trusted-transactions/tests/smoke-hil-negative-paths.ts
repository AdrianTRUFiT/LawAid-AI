import { evaluateTrustedTransactionHIL } from "../hilEvaluator";
import { happyPathScenario, negativeScenarios } from "../trustedTransactionFixtures";

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

const happy = evaluateTrustedTransactionHIL(happyPathScenario);
assert(happy.allowed, "Happy path should be allowed");
assert(happy.refusalCodes.length === 0, "Happy path should have zero refusal codes");

for (const scenario of negativeScenarios) {
  const result = evaluateTrustedTransactionHIL(scenario);
  assert(!result.allowed, `${scenario.name} should refuse`);
  assert(result.refusalCodes.length > 0, `${scenario.name} should emit refusal code`);
}

console.log("TRUSTED_TRANSACTIONS_HIL_NEGATIVE_PATH_EXPANSION=PASS");
console.log(`NEGATIVE_PATHS_TESTED=${negativeScenarios.length}`);
