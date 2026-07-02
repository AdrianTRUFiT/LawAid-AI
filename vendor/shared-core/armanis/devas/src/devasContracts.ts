export type DevasFrictionCategory =
  | "MANUAL_DATA_ENTRY_DUPLICATE_WORK"
  | "FRACTURED_TECH_STACK_SOFTWARE_SILOS"
  | "APPROVAL_BOTTLENECK"
  | "OVER_COORDINATION_MEETING_EMAIL_LOOP"
  | "PROCESS_DOCUMENTATION_TRAINING_GAP"
  | "VENDOR_INERTIA_PROCUREMENT_LOOP";

export type DevasImpactClass =
  | "LOW_IMPACT"
  | "MODERATE_IMPACT"
  | "MATERIAL_IMPACT"
  | "CRITICAL_IMPACT";

export type DevasDealAction =
  | "NO_ADJUSTMENT"
  | "PRICE_ADJUSTMENT_RECOMMENDED"
  | "CONDITIONS_REQUIRED"
  | "HOLDBACK_RECOMMENDED"
  | "EARNOUT_STRUCTURE_RECOMMENDED"
  | "INTEGRATION_REMEDIATION_REQUIRED"
  | "DEAL_HOLD_RECOMMENDED"
  | "DEAL_REFUSAL_RECOMMENDED";

export type DevasPacketStatus =
  | "ASSESSED"
  | "REFUSED";

export type DevasRefusalCode =
  | "MISSING_DEAL_ID"
  | "MISSING_BUYER_ID"
  | "MISSING_TARGET_ID"
  | "MISSING_FRICTION_SIGNALS"
  | "MISSING_BUYER_ADVANTAGE_PROFILE"
  | "INVALID_SCORE_RANGE"
  | "MISSING_ASSESSMENT_CONTEXT";

export interface DevasFrictionSignal {
  category: DevasFrictionCategory;
  severityScore: number;
  evidenceSummary: string;
  affectedArea: string;
  confidenceScore: number;
}

export interface DevasBuyerAdvantageProfile {
  buyerCanAbsorbRisk: boolean;
  buyerHasExistingSystemToFix: boolean;
  buyerIntegrationStrengthScore: number;
  buyerNegotiationLeverageScore: number;
}

export interface DevasInputPacket {
  dealId: string;
  buyerId: string;
  targetId: string;
  frictionSignals: DevasFrictionSignal[];
  buyerAdvantageProfile: DevasBuyerAdvantageProfile | null;
  assessmentContext: string;
}

export interface DevasFrictionAssessment {
  category: DevasFrictionCategory;
  severityScore: number;
  confidenceScore: number;
  weightedRiskScore: number;
  impactClass: DevasImpactClass;
  recommendedAction: DevasDealAction;
  affectedArea: string;
  evidenceSummary: string;
}

export interface DevasDecisionSummary {
  overallImpactClass: DevasImpactClass;
  recommendedAction: DevasDealAction;
  buyerAdvantageDetected: boolean;
  valueAssessmentSummary: string;
  negotiationUse: string;
}

export interface DevasValueAssessmentPacket {
  dealId: string;
  buyerId: string;
  targetId: string;
  status: DevasPacketStatus;
  overallImpactClass: DevasImpactClass | null;
  recommendedAction: DevasDealAction | null;
  buyerAdvantageDetected: boolean;
  valueAssessmentSummary: string;
  frictionFindings: DevasFrictionAssessment[];
  negotiationUse: string;
  refusalCodes: DevasRefusalCode[];
  humanFinalAuthority: true;
  finalAction: "";
  noFinanceModel: true;
  noLegalAdvice: true;
  noInvestmentAdvice: true;
  noLiveNegotiation: true;
  noExternalApis: true;
}