import { evaluateLwiHil, LWI_HIL_DOCTRINE } from "../lwi-hil-governance";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const accepted = evaluateLwiHil({
  decisionId: "lwi_hil_smoke_001",
  decisionType: "BUILD",
  actionDescription: "Encode LWI / HIL as a personal operating governance discipline.",
  availableContext: [
    "Plan B verification law",
    "RATE artifact law",
    "AI Coding Lab verification law",
    "Boundary-checked governance specification"
  ],
  authorityLayer: "PERSONAL_LAW",
  sourceTruthVerified: true,
  humanControlPreserved: true,
  architecturalDriftRisk: "LOW",
  exposureRisk: "LOW",
  consequenceRisk: "LOW"
});

assert(accepted.status === "LWI_HIL_ACCEPTED", "Clean LWI/HIL evaluation accepted");
assert(accepted.canProceed === true, "Accepted evaluation may proceed");
assert(accepted.boundary.lwiIsNotProduct === true, "LWI is not product");
assert(accepted.boundary.lwiIsNotUmbrella === true, "LWI is not umbrella");
assert(accepted.boundary.lwiIsNotRateEngine === true, "LWI is not RATE engine");
assert(accepted.boundary.lwiIsNotAuthorityOverride === true, "LWI is not authority override");
assert(accepted.boundary.hilDoesNotOutrunAuthority === true, "HIL does not outrun authority");

const blocked = evaluateLwiHil({
  decisionId: "lwi_hil_smoke_002",
  decisionType: "ACTIVATE",
  actionDescription: "Attempt activation without verified source truth.",
  availableContext: [],
  authorityLayer: "UNKNOWN",
  sourceTruthVerified: false,
  humanControlPreserved: false,
  architecturalDriftRisk: "HIGH",
  exposureRisk: "HIGH",
  consequenceRisk: "HIGH"
});

assert(blocked.status === "LWI_HIL_REQUIRES_HIGHER_CONTEXT", "Unsafe LWI/HIL evaluation blocked");
assert(blocked.canProceed === false, "Blocked evaluation cannot proceed");
assert(blocked.refusalReasons.includes("SOURCE_TRUTH_NOT_VERIFIED"), "Source truth refusal present");
assert(blocked.refusalReasons.includes("AUTHORITY_LAYER_UNKNOWN"), "Authority refusal present");
assert(blocked.refusalReasons.includes("HUMAN_CONTROL_NOT_PRESERVED"), "Human control refusal present");

assert(
  LWI_HIL_DOCTRINE.finalDoctrineLine ===
    "LWI ensures action does not outrun intelligence. HIL ensures intelligence does not outrun authority.",
  "Final doctrine line preserved"
);

console.log("");
console.log("LWI_HIL_GOVERNANCE_SMOKE=PASS");









