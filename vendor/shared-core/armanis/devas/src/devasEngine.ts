import type {
  DevasBuyerAdvantageProfile,
  DevasDealAction,
  DevasDecisionSummary,
  DevasFrictionAssessment,
  DevasFrictionSignal,
  DevasImpactClass,
  DevasInputPacket,
  DevasRefusalCode,
  DevasValueAssessmentPacket
} from "./devasContracts.js";

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function impactFromScore(score: number): DevasImpactClass {
  if (score >= 85) return "CRITICAL_IMPACT";
  if (score >= 65) return "MATERIAL_IMPACT";
  if (score >= 35) return "MODERATE_IMPACT";
  return "LOW_IMPACT";
}

function highestImpact(assessments: DevasFrictionAssessment[]): DevasImpactClass {
  const order: DevasImpactClass[] = [
    "LOW_IMPACT",
    "MODERATE_IMPACT",
    "MATERIAL_IMPACT",
    "CRITICAL_IMPACT"
  ];

  return assessments.reduce<DevasImpactClass>((highest, item) => {
    return order.indexOf(item.impactClass) > order.indexOf(highest)
      ? item.impactClass
      : highest;
  }, "LOW_IMPACT");
}

function maxWeightedRisk(assessments: DevasFrictionAssessment[]): number {
  return assessments.reduce((max, item) => Math.max(max, item.weightedRiskScore), 0);
}

function hasInvalidScore(packet: DevasInputPacket): boolean {
  const buyer = packet.buyerAdvantageProfile;

  const scores = [
    ...packet.frictionSignals.flatMap((signal) => [
      signal.severityScore,
      signal.confidenceScore
    ]),
    buyer?.buyerIntegrationStrengthScore ?? 0,
    buyer?.buyerNegotiationLeverageScore ?? 0
  ];

  return scores.some((score) => !Number.isFinite(score) || score < 0 || score > 100);
}

export function refuseIncompleteDevasPacket(packet: DevasInputPacket): DevasRefusalCode[] {
  const refusalCodes: DevasRefusalCode[] = [];

  if (!packet.dealId) refusalCodes.push("MISSING_DEAL_ID");
  if (!packet.buyerId) refusalCodes.push("MISSING_BUYER_ID");
  if (!packet.targetId) refusalCodes.push("MISSING_TARGET_ID");
  if (!packet.frictionSignals || packet.frictionSignals.length === 0) refusalCodes.push("MISSING_FRICTION_SIGNALS");
  if (!packet.buyerAdvantageProfile) refusalCodes.push("MISSING_BUYER_ADVANTAGE_PROFILE");
  if (!packet.assessmentContext) refusalCodes.push("MISSING_ASSESSMENT_CONTEXT");
  if (hasInvalidScore(packet)) refusalCodes.push("INVALID_SCORE_RANGE");

  return Array.from(new Set(refusalCodes));
}

export function calculateFrictionImpact(signal: DevasFrictionSignal): DevasImpactClass {
  const severity = clampScore(signal.severityScore);
  const confidence = clampScore(signal.confidenceScore);
  const weightedRiskScore = Math.round((severity * 0.7) + (confidence * 0.3));

  return impactFromScore(weightedRiskScore);
}

export function recommendDealAction(
  impactClass: DevasImpactClass,
  buyerAdvantageDetected: boolean
): DevasDealAction {
  if (impactClass === "CRITICAL_IMPACT") {
    return buyerAdvantageDetected
      ? "HOLDBACK_RECOMMENDED"
      : "DEAL_REFUSAL_RECOMMENDED";
  }

  if (impactClass === "MATERIAL_IMPACT") {
    return buyerAdvantageDetected
      ? "PRICE_ADJUSTMENT_RECOMMENDED"
      : "CONDITIONS_REQUIRED";
  }

  if (impactClass === "MODERATE_IMPACT") {
    return buyerAdvantageDetected
      ? "INTEGRATION_REMEDIATION_REQUIRED"
      : "CONDITIONS_REQUIRED";
  }

  return "NO_ADJUSTMENT";
}

export function calculateBuyerAdvantage(profile: DevasBuyerAdvantageProfile): boolean {
  const integrationStrength = clampScore(profile.buyerIntegrationStrengthScore);
  const leverage = clampScore(profile.buyerNegotiationLeverageScore);

  return Boolean(
    profile.buyerCanAbsorbRisk &&
    profile.buyerHasExistingSystemToFix &&
    integrationStrength >= 70 &&
    leverage >= 60
  );
}

export function assessFrictionSignal(
  signal: DevasFrictionSignal,
  buyerAdvantageDetected: boolean
): DevasFrictionAssessment {
  const severityScore = clampScore(signal.severityScore);
  const confidenceScore = clampScore(signal.confidenceScore);
  const weightedRiskScore = Math.round((severityScore * 0.7) + (confidenceScore * 0.3));
  const impactClass = impactFromScore(weightedRiskScore);

  return Object.freeze({
    category: signal.category,
    severityScore,
    confidenceScore,
    weightedRiskScore,
    impactClass,
    recommendedAction: recommendDealAction(impactClass, buyerAdvantageDetected),
    affectedArea: signal.affectedArea,
    evidenceSummary: signal.evidenceSummary
  });
}

function deriveOverallAction(
  overallImpactClass: DevasImpactClass,
  buyerAdvantageDetected: boolean,
  assessments: DevasFrictionAssessment[]
): DevasDealAction {
  const hasApprovalBottleneck = assessments.some((item) => item.category === "APPROVAL_BOTTLENECK");
  const hasCritical = assessments.some((item) => item.impactClass === "CRITICAL_IMPACT");

  if (hasCritical && !buyerAdvantageDetected) return "DEAL_REFUSAL_RECOMMENDED";
  if (hasCritical && buyerAdvantageDetected) return "HOLDBACK_RECOMMENDED";
  if (overallImpactClass === "MATERIAL_IMPACT" && buyerAdvantageDetected) return "PRICE_ADJUSTMENT_RECOMMENDED";
  if (overallImpactClass === "MATERIAL_IMPACT" && hasApprovalBottleneck) return "CONDITIONS_REQUIRED";
  if (overallImpactClass === "MATERIAL_IMPACT") return "CONDITIONS_REQUIRED";
  if (overallImpactClass === "MODERATE_IMPACT") return "INTEGRATION_REMEDIATION_REQUIRED";

  return "NO_ADJUSTMENT";
}

function buildDecisionSummary(input: {
  overallImpactClass: DevasImpactClass;
  recommendedAction: DevasDealAction;
  buyerAdvantageDetected: boolean;
  strongestRisk: number;
}): DevasDecisionSummary {
  const valueAssessmentSummary =
    input.buyerAdvantageDetected
      ? "Target friction creates integration risk, but buyer has sufficient operational strength to convert the weakness into post-close upside if priced and conditioned correctly."
      : "Target friction creates deal risk that should be resolved through conditions, remediation, holdback, or refusal before value is treated as stable.";

  const negotiationUse =
    input.buyerAdvantageDetected
      ? "Position friction as priced risk, not rejection."
      : "Position friction as unresolved operational risk requiring conditions before advancement.";

  return Object.freeze({
    overallImpactClass: input.overallImpactClass,
    recommendedAction: input.recommendedAction,
    buyerAdvantageDetected: input.buyerAdvantageDetected,
    valueAssessmentSummary,
    negotiationUse
  });
}

export function generateDevasValueAssessmentPacket(packet: DevasInputPacket): DevasValueAssessmentPacket {
  const refusalCodes = refuseIncompleteDevasPacket(packet);

  if (refusalCodes.length > 0 || !packet.buyerAdvantageProfile) {
    return Object.freeze({
      dealId: packet.dealId,
      buyerId: packet.buyerId,
      targetId: packet.targetId,
      status: "REFUSED",
      overallImpactClass: null,
      recommendedAction: null,
      buyerAdvantageDetected: false,
      valueAssessmentSummary: "DEVAS refused the packet because required deal-value assessment inputs were missing or invalid.",
      frictionFindings: [],
      negotiationUse: "Do not use for negotiation posture until packet is complete.",
      refusalCodes,
      humanFinalAuthority: true,
      finalAction: "",
      noFinanceModel: true,
      noLegalAdvice: true,
      noInvestmentAdvice: true,
      noLiveNegotiation: true,
      noExternalApis: true
    });
  }

  const buyerAdvantageDetected = calculateBuyerAdvantage(packet.buyerAdvantageProfile);
  const frictionFindings = packet.frictionSignals.map((signal) =>
    assessFrictionSignal(signal, buyerAdvantageDetected)
  );

  const overallImpactClass = highestImpact(frictionFindings);
  const recommendedAction = deriveOverallAction(
    overallImpactClass,
    buyerAdvantageDetected,
    frictionFindings
  );

  const decision = buildDecisionSummary({
    overallImpactClass,
    recommendedAction,
    buyerAdvantageDetected,
    strongestRisk: maxWeightedRisk(frictionFindings)
  });

  return Object.freeze({
    dealId: packet.dealId,
    buyerId: packet.buyerId,
    targetId: packet.targetId,
    status: "ASSESSED",
    overallImpactClass,
    recommendedAction,
    buyerAdvantageDetected,
    valueAssessmentSummary: decision.valueAssessmentSummary,
    frictionFindings,
    negotiationUse: decision.negotiationUse,
    refusalCodes: [],
    humanFinalAuthority: true,
    finalAction: "",
    noFinanceModel: true,
    noLegalAdvice: true,
    noInvestmentAdvice: true,
    noLiveNegotiation: true,
    noExternalApis: true
  });
}