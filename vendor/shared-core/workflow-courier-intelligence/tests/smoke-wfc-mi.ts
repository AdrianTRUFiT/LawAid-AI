import { buildMovementIntelligenceSnapshot } from "../index";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const pass = buildMovementIntelligenceSnapshot({ signed: true });
assert(pass.registryLookup.status === "verified", "expected signed lookup to verify");
assert(pass.soul256Projection.verified === true, "expected SOUL256 projection to verify");
assert(pass.failureInvestigation.status === "no_failure_detected", "expected no failure");
assert(pass.impactRadius.blocked.length === 0, "expected no blocked impacts on verified path");
assert(pass.boundary.fundTrackerAIRemainsTruthAuthority === true, "FundTrackerAI boundary must remain true");

const fail = buildMovementIntelligenceSnapshot({ signed: false, refused: true });
assert(fail.registryLookup.status === "not_verified", "expected unsigned lookup to fail verification");
assert(fail.soul256Projection.verified === false, "expected SOUL256 projection to block");
assert(fail.soul256Projection.noCount === 1, "expected one NO checkpoint");
assert(fail.failureInvestigation.status === "failure_detected", "expected failure investigation");
assert(fail.impactRadius.blocked.includes("fund-release"), "expected fund release blocked");
assert(fail.boundary.wfcCreatesTruth === false, "WFC must not create truth");
assert(fail.boundary.miCreatesTruth === false, "MI must not create truth");
assert(fail.boundary.registryCreatesTruth === false, "Registry must not create truth");

console.log("WFC_MI_MOVEMENT_INTELLIGENCE_SMOKE_PASS");
console.log("PASS_LOOKUP_STATUS=" + pass.registryLookup.status);
console.log("PASS_SOUL256_VERIFIED=" + pass.soul256Projection.verified);
console.log("FAIL_LOOKUP_STATUS=" + fail.registryLookup.status);
console.log("FAIL_SOUL256_NO_COUNT=" + fail.soul256Projection.noCount);
console.log("FAIL_CONSEQUENCE_STATE=" + fail.soul256Projection.consequenceState);
