import {
  generateNeilNegotiationPacket,
  PRIMETIME_ACTIVATION_PHRASE,
  type NeilNegotiationContext
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const baseContext: NeilNegotiationContext = {
  contextId: "ctx_pass_1_1",
  createdAt: "2026-05-16T00:00:00.000Z",
  matterType: "ARMANIS_DEAL_NEGOTIATION",
  counterpart: "Counterparty B",
  objective: "Prepare bounded acquisition negotiation response.",
  pressureLevel: "HIGH",
  knownFacts: ["ARMANIS reference indicates conditional readiness."],
  constraints: ["No live negotiation.", "Human approval required."],
  requestedOutcome: "Prepare response packet for human review.",
  primetimeTriggerPhrase: PRIMETIME_ACTIVATION_PHRASE,
  armanisReference: {
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
  },
  legalAuthorityClaimed: false,
  liveNegotiationRequested: false,
  externalApiUsed: false,
  paymentRequested: false,
  signatureRequested: false
};

const packet = generateNeilNegotiationPacket(baseContext);

assert(packet.status === "PRIMETIME_ACTIVE", "Primetime packet must remain active.");
assert(packet.safetyReview.pressurePosture === "PRIMETIME", "Primetime posture must be derived.");
assert(packet.safetyReview.responseCompression === "COMPRESSED", "Primetime response must be compressed.");
assert(packet.safetyReview.safetyFlags.includes("HUMAN_REVIEW_REQUIRED"), "Human review safety flag required.");
assert(packet.strategyMoves[0] === "STRATEGIC_SILENCE", "Strategy moves must normalize priority order.");
assert(packet.strategyMoves.includes("REQUEST_PROOF"), "Request proof must remain.");
assert(packet.strategyMoves.includes("HUMAN_REVIEW_ONLY"), "Human review only must remain.");
assert(packet.finalAuthority === "Human", "Human must remain final authority.");
assert(packet.finalAction === "", "Final action must remain blank.");
console.log("NEIL_PASS1_1_STRATEGY_NORMALIZATION_PASS");

const hostile = generateNeilNegotiationPacket({
  ...baseContext,
  contextId: "ctx_hostile_1_1",
  pressureLevel: "HOSTILE",
  primetimeTriggerPhrase: null
});

assert(hostile.status === "ESCALATE_TO_HUMAN", "Hostile pressure must escalate to human.");
assert(hostile.safetyReview.pressurePosture === "ESCALATE", "Hostile posture must be ESCALATE.");
assert(hostile.safetyReview.safetyFlags.includes("HOSTILE_PRESSURE_ESCALATION"), "Hostile safety flag required.");
console.log("NEIL_PASS1_1_HOSTILE_ESCALATION_PASS");

const refused = generateNeilNegotiationPacket({
  ...baseContext,
  contextId: "ctx_refused_1_1",
  externalApiUsed: true,
  liveNegotiationRequested: true,
  paymentRequested: true,
  signatureRequested: true,
  legalAuthorityClaimed: true
});

assert(refused.status === "REFUSED_BOUNDARY", "Boundary violations must refuse.");
assert(refused.safetyReview.safetyFlags.includes("EXTERNAL_API_REFUSED"), "External API refusal flag required.");
assert(refused.safetyReview.safetyFlags.includes("LIVE_NEGOTIATION_REFUSED"), "Live negotiation refusal flag required.");
assert(refused.safetyReview.safetyFlags.includes("PAYMENT_REFUSED"), "Payment refusal flag required.");
assert(refused.safetyReview.safetyFlags.includes("SIGNATURE_REFUSED"), "Signature refusal flag required.");
assert(refused.safetyReview.safetyFlags.includes("LEGAL_AUTHORITY_REFUSED"), "Legal authority refusal flag required.");
console.log("NEIL_PASS1_1_BOUNDARY_SAFETY_PASS");

console.log("NEIL_PASS1_1_SMOKE=PASS");
console.log(JSON.stringify({
  status: packet.status,
  pressurePosture: packet.safetyReview.pressurePosture,
  responseCompression: packet.safetyReview.responseCompression,
  strategyMoves: packet.strategyMoves,
  hostileStatus: hostile.status,
  refusedStatus: refused.status,
  finalAuthority: packet.finalAuthority,
  finalAction: packet.finalAction
}, null, 2));