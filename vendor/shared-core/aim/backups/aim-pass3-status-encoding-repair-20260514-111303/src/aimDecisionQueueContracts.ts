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

export type AimPaiSafeDecisionReviewStatus =
  | "SAFE TO REVIEW"
  | "HOLD FOR CONFIRMATION"
  | "REFUSED â€” INSUFFICIENT SIGNAL"
  | "REFUSED â€” THESIS CONTRADICTION"
  | "REFUSED â€” RISK TOO HIGH"
  | "REFUSED â€” UNDOCUMENTED ACTION";

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