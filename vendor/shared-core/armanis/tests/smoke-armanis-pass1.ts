import {
  assessAcquirerReadiness,
  assessTargetReadiness,
  calculateCompatibility,
  generateDealAnswerPacket,
  refuseIncompletePacket,
  type AcquirerProfile,
  type TargetProfile
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const acquirer: AcquirerProfile = {
  companyId: "ACQ_A",
  companyName: "Company A",
  createdAt: "2026-05-16T00:00:00.000Z",
  acquisitionIntent: "Acquire agentic-ready workflow target.",
  integrationCapacity: 88,
  capitalReadiness: 88,
  evidenceSummary: "Acquirer has governance, capital readiness, and integration capacity.",
  knownGaps: [],
  humanAuthorityConfirmed: true,
  auditTrailAvailable: true,
  proofContinuityAvailable: true,
  externalApiUsed: false,
  legalAuthorityClaimed: false,
  scores: {
    aiGovernance: 84,
    dataCustody: 88,
    workflowTransferability: 80,
    authorizationClarity: 82,
    humanOverride: 88,
    auditability: 86,
    integrationReadiness: 84,
    negotiationPreparedness: 82,
    proofContinuity: 90
  }
};

const targetB: TargetProfile = {
  companyId: "TARGET_B",
  companyName: "Company B",
  createdAt: "2026-05-16T00:00:00.000Z",
  transferReadiness: 86,
  operationalDependencyRisk: 10,
  dataRoomPreparedness: 82,
  evidenceSummary: "Target has strong transfer readiness and lower integration uncertainty.",
  knownGaps: [
    "Clarify AI authorization boundaries",
    "Document human override process",
    "Verify data custody transfer path"
  ],
  humanAuthorityConfirmed: false,
  auditTrailAvailable: true,
  proofContinuityAvailable: false,
  externalApiUsed: false,
  legalAuthorityClaimed: false,
  scores: {
    aiGovernance: 84,
    dataCustody: 86,
    workflowTransferability: 87,
    authorizationClarity: 74,
    humanOverride: 76,
    auditability: 84,
    integrationReadiness: 92,
    negotiationPreparedness: 82,
    proofContinuity: 92
  }
};

const targetC: TargetProfile = {
  ...targetB,
  companyId: "TARGET_C",
  companyName: "Company C",
  transferReadiness: 62,
  operationalDependencyRisk: 55,
  dataRoomPreparedness: 60,
  evidenceSummary: "Target has weaker readiness and higher integration uncertainty.",
  knownGaps: ["Reduce operational dependency risk."],
  scores: {
    aiGovernance: 58,
    dataCustody: 61,
    workflowTransferability: 62,
    authorizationClarity: 55,
    humanOverride: 60,
    auditability: 62,
    integrationReadiness: 61,
    negotiationPreparedness: 58,
    proofContinuity: 60
  }
};

const acquirerAssessment = assessAcquirerReadiness(acquirer);
assert(acquirerAssessment.averageScore >= 80, "ACQUIRER_READY_PASS failed.");
assert(acquirerAssessment.status === "SAFE_TO_ACQUIRE", "Acquirer should be safe to acquire.");
console.log("ACQUIRER_READY_PASS");

const targetAssessment = assessTargetReadiness(targetB);
assert(targetAssessment.averageScore >= 75, "TARGET_READY_PASS failed.");
assert(targetAssessment.certificationLevel === "LEVEL_3_TRANSFER_READINESS", "Target B should issue Level 3 certification.");
console.log("TARGET_READY_PASS");

const compatibility = calculateCompatibility(acquirer, targetB);
assert(compatibility.compatibilityScore >= 80, "MATCH_COMPATIBILITY_PASS failed.");
assert(compatibility.status === "SAFE_WITH_CONDITIONS", "Compatibility should be safe with conditions.");
console.log("MATCH_COMPATIBILITY_PASS");

assert(targetAssessment.certificationLevel === "LEVEL_3_TRANSFER_READINESS", "CERTIFICATION_LEVEL_ISSUED failed.");
console.log("CERTIFICATION_LEVEL_ISSUED");

const refused = refuseIncompletePacket({ companyName: "Incomplete Company" });
assert(refused.status === "REFUSED", "INCOMPLETE_PACKET_REFUSED failed.");
assert(refused.refusedReasons.length > 0, "Incomplete refusal reason required.");
console.log("INCOMPLETE_PACKET_REFUSED");

const answer = generateDealAnswerPacket(acquirer, [targetC, targetB]);
assert(answer.recommendedTarget === "Company B", "Deal answer should recommend stronger target.");
assert(answer.status === "SAFE_WITH_CONDITIONS", "Deal answer status should be SAFE_WITH_CONDITIONS.");
assert(answer.certificationLevel === "LEVEL_3_TRANSFER_READINESS", "Deal answer certification should be Level 3.");
assert(answer.compatibilityScore >= 80, "Deal answer compatibility score should be high.");
assert(answer.conditions.includes("Clarify AI authorization boundaries"), "Deal answer should include authorization condition.");
assert(answer.conditions.includes("Document human override process"), "Deal answer should include human override condition.");
assert(answer.conditions.includes("Verify data custody transfer path"), "Deal answer should include custody transfer condition.");
assert(answer.noLiveNegotiation === true, "No live negotiation allowed.");
assert(answer.noPayments === true, "No payments allowed.");
assert(answer.noBlockchain === true, "No blockchain allowed.");
assert(answer.noExternalApis === true, "No external APIs allowed.");
assert(answer.noLegalAuthority === true, "No legal authority claims allowed.");
assert(answer.noMarketplace === true, "No marketplace allowed.");
assert(answer.finalAuthority === "Human", "Human must remain final authority.");
assert(answer.finalAction === "", "Final action must remain blank.");
console.log("DEAL_ANSWER_PACKET_GENERATED");

console.log("ARMANIS_PASS1_SMOKE=PASS");
console.log(JSON.stringify({
  status: answer.status,
  recommendedTarget: answer.recommendedTarget,
  certificationLevel: answer.certificationLevel,
  compatibilityScore: answer.compatibilityScore,
  conditions: answer.conditions,
  decisionSummary: answer.decisionSummary
}, null, 2));