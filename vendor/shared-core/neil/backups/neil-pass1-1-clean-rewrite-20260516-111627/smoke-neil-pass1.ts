import {
  createNeilNegotiationArtifact,
  evaluatePrimetimeMode,
  generateNeilNegotiationPacket,
  PRIMETIME_ACTIVATION_PHRASE,
  PRIMETIME_DEACTIVATION_PHRASE,
  type NeilArmanisReference,
  type NeilNegotiationContext
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const armanisReference: NeilArmanisReference = {
  status: "SAFE_WITH_CONDITIONS",
  recommendedTarget: "Company B",
  certificationLevel: "LEVEL_3_TRANSFER_READINESS",
  compatibilityScore: 87,
  conditions: [
    "Clarify AI authorization boundaries.",
    "Document human override process.",
    "Verify data custody transfer path."
  ],
  decisionSummary: "Company B is the stronger acquisition candidate due to higher transfer readiness and lower integration uncertainty.",
  finalAuthority: "Human",
  finalAction: ""
};

const baseContext: NeilNegotiationContext = {
  contextId: "ctx_001",
  createdAt: "2026-05-16T00:00:00.000Z",
  matterType: "ARMANIS_DEAL_NEGOTIATION",
  counterpart: "Counterparty B",
  objective: "Prepare bounded acquisition negotiation response.",
  pressureLevel: "HIGH",
  knownFacts: ["ARMANIS reference indicates Company B is stronger but conditional."],
  constraints: ["No live negotiation.", "Human approval required."],
  requestedOutcome: "Prepare response packet for human review.",
  primetimeTriggerPhrase: PRIMETIME_ACTIVATION_PHRASE,
  armanisReference,
  legalAuthorityClaimed: false,
  liveNegotiationRequested: false,
  externalApiUsed: false,
  paymentRequested: false,
  signatureRequested: false
};

assert(evaluatePrimetimeMode(PRIMETIME_ACTIVATION_PHRASE) === "ACTIVE", "PRIMETIME_ACTIVATION_PASS failed.");
console.log("PRIMETIME_ACTIVATION_PASS");

assert(evaluatePrimetimeMode(PRIMETIME_DEACTIVATION_PHRASE) === "DEACTIVATED", "PRIMETIME_DEACTIVATION_PASS failed.");
console.log("PRIMETIME_DEACTIVATION_PASS");

const dealPacket = generateNeilNegotiationPacket(baseContext);
assert(dealPacket.status === "PRIMETIME_ACTIVE", "ARMANIS deal context should activate Primetime packet.");
assert(dealPacket.armanisStatus === "SAFE_WITH_CONDITIONS", "ARMANIS status must be carried into NEIL.");
assert(dealPacket.armanisCertificationLevel === "LEVEL_3_TRANSFER_READINESS", "ARMANIS certification must be carried into NEIL.");
assert(dealPacket.armanisCompatibilityScore === 87, "ARMANIS compatibility score must be carried into NEIL.");
assert(dealPacket.strategyMoves.includes("STRATEGIC_SILENCE"), "Strategic silence must be present under pressure.");
assert(dealPacket.strategyMoves.includes("REQUEST_PROOF"), "Request proof move must be present.");
console.log("ARMANIS_DEAL_CONTEXT_ACCEPTED");

const lawAiPacket = generateNeilNegotiationPacket({
  ...baseContext,
  contextId: "ctx_lawai_001",
  matterType: "LAWAI_NEGOTIATION",
  counterpart: "Opposing party",
  objective: "Prepare bounded LawAidAI negotiation response.",
  knownFacts: ["Documented communication dispute exists."],
  armanisReference: null
});
assert(lawAiPacket.matterType === "LAWAI_NEGOTIATION", "LawAidAI negotiation context must be accepted.");
assert(lawAiPacket.strategyMoves.includes("CLARIFY_AUTHORITY"), "LawAidAI context must clarify authority.");
assert(lawAiPacket.strategyMoves.includes("DELAY_UNTIL_DOCUMENTED"), "LawAidAI context must delay until documented.");
assert(lawAiPacket.noLegalAuthority === true, "LawAidAI context must not claim legal authority.");
console.log("LAWAI_NEGOTIATION_CONTEXT_ACCEPTED");

const incompletePacket = generateNeilNegotiationPacket({
  ...baseContext,
  contextId: "ctx_incomplete_001",
  knownFacts: [],
  requestedOutcome: ""
});
assert(incompletePacket.status === "HOLD_FOR_CONTEXT", "Incomplete context must hold.");
assert(incompletePacket.conditions.includes("Complete negotiation context before review."), "Incomplete condition required.");
console.log("INCOMPLETE_CONTEXT_HELD");

const refusedPacket = generateNeilNegotiationPacket({
  ...baseContext,
  contextId: "ctx_refused_001",
  liveNegotiationRequested: true,
  paymentRequested: true,
  signatureRequested: true,
  externalApiUsed: true,
  legalAuthorityClaimed: false
});
assert(refusedPacket.status === "REFUSED_BOUNDARY", "Boundary violation must refuse.");
assert(refusedPacket.refusalReasons.length >= 4, "Boundary refusal reasons required.");
console.log("BOUNDARY_REFUSED");

assert(dealPacket.noLiveNegotiation === true, "No live negotiation allowed.");
assert(dealPacket.noPayments === true, "No payments allowed.");
assert(dealPacket.noSignature === true, "No signature allowed.");
assert(dealPacket.noExternalApis === true, "No external APIs allowed.");
assert(dealPacket.noLegalAuthority === true, "No legal authority allowed.");
assert(dealPacket.finalAuthority === "Human", "Human must remain final authority.");
assert(dealPacket.finalAction === "", "Final action must remain blank.");
console.log("NO_LIVE_NEGOTIATION_EXECUTION");

const artifact = createNeilNegotiationArtifact(dealPacket);
assert(artifact.packetId === dealPacket.packetId, "Artifact must preserve packetId.");
assert(artifact.primetimeModeState === "ACTIVE", "Artifact must preserve Primetime active state.");
assert(artifact.humanReviewRequired === true, "Artifact must preserve human review.");
console.log("NEIL_ARTIFACT_GENERATED");

console.log("NEIL_PASS1_SMOKE=PASS");
console.log(JSON.stringify({
  status: dealPacket.status,
  matterType: dealPacket.matterType,
  primetimeMode: dealPacket.primetimeMode.modeState,
  strategyMoves: dealPacket.strategyMoves,
  armanisStatus: dealPacket.armanisStatus,
  armanisCertificationLevel: dealPacket.armanisCertificationLevel,
  armanisCompatibilityScore: dealPacket.armanisCompatibilityScore,
  responseDraft: dealPacket.responseDraft,
  finalAuthority: dealPacket.finalAuthority,
  finalAction: dealPacket.finalAction
}, null, 2));