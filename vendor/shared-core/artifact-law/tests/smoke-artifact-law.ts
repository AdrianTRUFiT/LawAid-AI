import { resolvePlacement, canModuleEmit, canTransition } from "../placementResolver";
import { ARTIFACT_TYPES } from "../artifactTypes";
import { runConsequenceGate } from "../consequenceGate";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error("FAILED:", message);
    process.exit(1);
  }
}

const capturedPlacement = resolvePlacement(ARTIFACT_TYPES.CAPTURED_SIGNAL);
assert(capturedPlacement.allowed, "Captured Signal should resolve.");
assert(capturedPlacement.owner === "DICE", "Captured Signal owner should be DICE.");
assert(capturedPlacement.nextAllowedModule === "AIOP", "Captured Signal should move to AIOP next.");

const diceEmit = canModuleEmit("DICE", ARTIFACT_TYPES.CAPTURED_SIGNAL);
assert(diceEmit.allowed, "DICE should emit Captured Signal.");

const badDiceEmit = canModuleEmit("DICE", ARTIFACT_TYPES.VERIFIED_OPPORTUNITY);
assert(!badDiceEmit.allowed, "DICE must not emit Verified Opportunity.");

const transition = canTransition(
  ARTIFACT_TYPES.CAPTURED_SIGNAL,
  ARTIFACT_TYPES.VERIFIED_OPPORTUNITY,
  "DICE",
  "AIOP"
);
assert(transition.allowed, "Captured Signal should transition from DICE to AIOP.");

const badTransition = canTransition(
  ARTIFACT_TYPES.CAPTURED_SIGNAL,
  ARTIFACT_TYPES.ACTIVATED_TRANSACTION_STATE,
  "DICE",
  "FundTrackerAI"
);
assert(!badTransition.allowed, "DICE must not jump to Activated Transaction State.");

const gatePass = runConsequenceGate({
  presence: true,
  source: true,
  integrity: true,
  state: true,
  authorizedBy: "SYSTEM_TEST",
  authorizationScope: "artifact-law-smoke",
  mayCreateConsequence: true,
  consequenceType: "record_creation",
  recordToCreate: "test-record",
  continuityTarget: "test-continuity"
});
assert(gatePass.allowed, "Consequence gate should pass with full proof chain.");

const gateFail = runConsequenceGate({
  presence: true,
  source: true
});
assert(!gateFail.allowed, "Consequence gate should refuse incomplete proof chain.");

console.log("ARTIFACT LAW LAYER PASSED");
console.log("Captured Signal owner:", capturedPlacement.owner);
console.log("Captured Signal next:", capturedPlacement.nextAllowedModule);
console.log("Bad DICE emit refused:", badDiceEmit.reason);
console.log("Bad transition refused:", badTransition.reason);
console.log("Gate refusal stage:", gateFail.stage);
