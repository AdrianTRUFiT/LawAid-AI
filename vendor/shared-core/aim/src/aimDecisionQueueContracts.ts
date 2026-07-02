export type AimDepartmentOrigin =
  | "Research"
  | "Market Intelligence"
  | "Portfolio Learning"
  | "Capital Planning"
  | "Infrastructure Mapping"
  | "Risk Review"
  | "Strategy";

export type AimAgentOrigin =
  | "Data Developer AI"
  | "Strategic Thinker AI"
  | "Critical Thinker AI"
  | "Intelligent Processor AI"
  | "Brand Intelligence AI"
  | "Dispatcher AI"
  | "Manual Operator";

export type AimDecisionSignalType =
  | "market research"
  | "infrastructure pressure"
  | "dependency shift"
  | "timing intelligence"
  | "opportunity detection"
  | "capital planning"
  | "contradiction surfacing"
  | "portfolio learning";

export type AimEvidenceStrength =
  | "Strong"
  | "Moderate"
  | "Weak"
  | "Insufficient"
  | "Contradicted"
  | "Undocumented";

export type AimRiskClass =
  | "Low"
  | "Moderate"
  | "Elevated"
  | "Excessive";

export type AimTimingContext =
  | "Dormant"
  | "Watch"
  | "Developing"
  | "Time Sensitive"
  | "Too Early"
  | "Too Late"
  | "Unknown";

export type AimUrgencyLevel =
  | "Low"
  | "Medium"
  | "High"
  | "Immediate Review";

export const AIM_PAI_SAFE_DECISION_STATUS = {
  SAFE_TO_REVIEW: "SAFE TO REVIEW",
  HOLD_FOR_CONFIRMATION: "HOLD FOR CONFIRMATION",
  REFUSED_INSUFFICIENT_SIGNAL: "REFUSED \u2014 INSUFFICIENT SIGNAL",
  REFUSED_THESIS_CONTRADICTION: "REFUSED \u2014 THESIS CONTRADICTION",
  REFUSED_RISK_TOO_HIGH: "REFUSED \u2014 RISK TOO HIGH",
  REFUSED_UNDOCUMENTED_ACTION: "REFUSED \u2014 UNDOCUMENTED ACTION"
} as const;

export type AimPaiSafeDecisionReviewStatus =
  (typeof AIM_PAI_SAFE_DECISION_STATUS)[keyof typeof AIM_PAI_SAFE_DECISION_STATUS];

export type AimFinalAuthority = "Human";

export interface AimStructuredDecisionInput {
  sourceInputs: string[];
  departmentOrigin: AimDepartmentOrigin;
  agentOrigin: AimAgentOrigin;
  signalType: AimDecisionSignalType;
  assetOrSubject: string;
  thesisReference: string;
  evidenceSummary: string;
  evidenceStrength: AimEvidenceStrength;
  contradictionFlags: string[];
  riskClass: AimRiskClass;
  timingContext: AimTimingContext;
  urgencyLevel: AimUrgencyLevel;
  proposedAction: string;
  documentationRefs: string[];
  nextStep?: string;
}

export interface AimPaiSafeReviewPacket {
  decisionId: string;
  status: AimPaiSafeDecisionReviewStatus;
  reasons: string[];
  readyForHumanReview: boolean;
  mayApproveInvestment: false;
  mayExecuteTrade: false;
  mayProvideFinancialAdvice: false;
  humanAuthorityRequired: true;
}

export interface AimDecisionItem {
  decisionId: string;
  createdAt: string;
  sourceInputs: string[];
  departmentOrigin: AimDepartmentOrigin;
  agentOrigin: AimAgentOrigin;
  signalType: AimDecisionSignalType;
  assetOrSubject: string;
  thesisReference: string;
  evidenceSummary: string;
  evidenceStrength: AimEvidenceStrength;
  contradictionFlags: string[];
  riskClass: AimRiskClass;
  timingContext: AimTimingContext;
  urgencyLevel: AimUrgencyLevel;
  proposedAction: string;
  prohibitedActionFlag: boolean;
  paiSafeStatus: AimPaiSafeDecisionReviewStatus;
  humanReviewRequired: true;
  journalRequired: true;
  finalAuthority: AimFinalAuthority;
  nextStep: string;
  paiSafeReviewPacket: AimPaiSafeReviewPacket;
}