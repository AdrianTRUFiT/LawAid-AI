export type InquiryProblemClass =
  | "coordination"
  | "cost_control"
  | "urgency"
  | "quality"
  | "unknown";

export type InquiryDecision =
  | "ADVANCE"
  | "COMPARE"
  | "HOLD"
  | "REFUSE";

export interface ProblemLedInquiryInput {
  subjectId: string;
  inquiryText: string;
  partyCount: number;
  budgetSensitivity: number;
  urgencySensitivity: number;
  qualitySensitivity: number;
}

export interface ProblemLedInquiryArtifact {
  inquiryIntelligenceId: string;
  subjectId: string;
  problemClass: InquiryProblemClass;
  governingDecision: InquiryDecision;
  whyScore: number;
  movementScore: number;
  poolingCandidate: boolean;
  reason: string;
  createdAt: string;
}

export interface ProblemLedInquiryRefusal {
  refusalCode:
    | "INVALID_INQUIRY"
    | "INVALID_SCORE";
  refusalReason: string;
}

export interface ProblemLedInquiryResult {
  ok: boolean;
  artifact: ProblemLedInquiryArtifact | null;
  refusal: ProblemLedInquiryRefusal | null;
}