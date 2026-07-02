import {
  assessFrictionSignal,
  calculateBuyerAdvantage,
  generateDevasValueAssessmentPacket,
  recommendDealAction,
  type DevasInputPacket
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const materialPacket: DevasInputPacket = {
  dealId: "DEAL-001",
  buyerId: "BUYER-001",
  targetId: "TARGET-001",
  assessmentContext: "Operational diligence review for agentic acquisition readiness.",
  buyerAdvantageProfile: {
    buyerCanAbsorbRisk: true,
    buyerHasExistingSystemToFix: true,
    buyerIntegrationStrengthScore: 86,
    buyerNegotiationLeverageScore: 78
  },
  frictionSignals: [
    {
      category: "FRACTURED_TECH_STACK_SOFTWARE_SILOS",
      severityScore: 72,
      evidenceSummary: "Target relies on disconnected CRM, inventory, billing, and fulfillment workflows.",
      affectedArea: "Operations and integration readiness",
      confidenceScore: 80
    }
  ]
};

const advantage = calculateBuyerAdvantage(materialPacket.buyerAdvantageProfile!);
assert(advantage === true, "DEVAS_BUYER_ADVANTAGE_PASS failed.");
console.log("DEVAS_BUYER_ADVANTAGE_PASS");

const friction = assessFrictionSignal(materialPacket.frictionSignals[0]!, advantage);
assert(friction.impactClass === "MATERIAL_IMPACT", "DEVAS_FRICTION_ASSESSMENT_PASS failed.");
assert(friction.recommendedAction === "PRICE_ADJUSTMENT_RECOMMENDED", "Material friction with buyer advantage should recommend price adjustment.");
console.log("DEVAS_FRICTION_ASSESSMENT_PASS");

const materialAssessment = generateDevasValueAssessmentPacket(materialPacket);
assert(materialAssessment.status === "ASSESSED", "DEVAS value packet should assess.");
assert(materialAssessment.overallImpactClass === "MATERIAL_IMPACT", "Overall impact should be material.");
assert(materialAssessment.recommendedAction === "PRICE_ADJUSTMENT_RECOMMENDED", "DEVAS_PRICE_ADJUSTMENT_PASS failed.");
assert(materialAssessment.buyerAdvantageDetected === true, "Buyer advantage must be detected.");
assert(materialAssessment.negotiationUse === "Position friction as priced risk, not rejection.", "Negotiation use mismatch.");
assert(materialAssessment.finalAction === "", "Final action must remain blank.");
console.log("DEVAS_PRICE_ADJUSTMENT_PASS");

const conditionsPacket: DevasInputPacket = {
  ...materialPacket,
  dealId: "DEAL-002",
  buyerAdvantageProfile: {
    buyerCanAbsorbRisk: false,
    buyerHasExistingSystemToFix: false,
    buyerIntegrationStrengthScore: 45,
    buyerNegotiationLeverageScore: 50
  },
  frictionSignals: [
    {
      category: "APPROVAL_BOTTLENECK",
      severityScore: 76,
      evidenceSummary: "Target requires owner approval across routine sales, procurement, refunds, and vendor changes.",
      affectedArea: "Decision velocity",
      confidenceScore: 74
    }
  ]
};

const conditionsAssessment = generateDevasValueAssessmentPacket(conditionsPacket);
assert(conditionsAssessment.status === "ASSESSED", "Conditions packet should assess.");
assert(conditionsAssessment.overallImpactClass === "MATERIAL_IMPACT", "Conditions packet should be material.");
assert(conditionsAssessment.recommendedAction === "CONDITIONS_REQUIRED", "DEVAS_CONDITIONS_REQUIRED_PASS failed.");
console.log("DEVAS_CONDITIONS_REQUIRED_PASS");

const refused = generateDevasValueAssessmentPacket({
  dealId: "",
  buyerId: "BUYER-003",
  targetId: "TARGET-003",
  assessmentContext: "",
  buyerAdvantageProfile: null,
  frictionSignals: []
});

assert(refused.status === "REFUSED", "Incomplete packet must refuse.");
assert(refused.refusalCodes.includes("MISSING_DEAL_ID"), "Missing deal id refusal required.");
assert(refused.refusalCodes.includes("MISSING_FRICTION_SIGNALS"), "Missing friction signals refusal required.");
assert(refused.refusalCodes.includes("MISSING_BUYER_ADVANTAGE_PROFILE"), "Missing buyer profile refusal required.");
assert(refused.refusalCodes.includes("MISSING_ASSESSMENT_CONTEXT"), "Missing assessment context refusal required.");
console.log("DEVAS_INCOMPLETE_PACKET_REFUSED");

assert(materialAssessment.frictionFindings.length === 1, "Friction findings must generate.");
assert(materialAssessment.noFinanceModel === true, "DEVAS must not be finance model.");
assert(materialAssessment.noLegalAdvice === true, "DEVAS must not be legal advice.");
assert(materialAssessment.noInvestmentAdvice === true, "DEVAS must not be investment advice.");
assert(materialAssessment.noLiveNegotiation === true, "DEVAS must not execute negotiation.");
assert(materialAssessment.noExternalApis === true, "DEVAS must not use external APIs.");
assert(materialAssessment.humanFinalAuthority === true, "Human final authority required.");
console.log("DEVAS_VALUE_ASSESSMENT_PACKET_GENERATED");

assert(recommendDealAction("LOW_IMPACT", true) === "NO_ADJUSTMENT", "Low impact should not adjust.");

console.log("DEVAS_PASS1_SMOKE=PASS");
console.log(JSON.stringify({
  dealId: materialAssessment.dealId,
  status: materialAssessment.status,
  overallImpactClass: materialAssessment.overallImpactClass,
  recommendedAction: materialAssessment.recommendedAction,
  buyerAdvantageDetected: materialAssessment.buyerAdvantageDetected,
  valueAssessmentSummary: materialAssessment.valueAssessmentSummary,
  frictionFindings: materialAssessment.frictionFindings.map((finding) => ({
    category: finding.category,
    impactClass: finding.impactClass,
    recommendedAction: finding.recommendedAction
  })),
  negotiationUse: materialAssessment.negotiationUse,
  finalAuthority: "Human",
  finalAction: materialAssessment.finalAction
}, null, 2));