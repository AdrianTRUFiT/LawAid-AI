import type {
  AimDecisionItem,
  AimPaiSafeDecisionReviewStatus,
  AimStructuredDecisionInput
} from "./aimDecisionQueueContracts.js";

export type AimJournalPacketStatus =
  | "JOURNAL_READY"
  | "JOURNAL_HELD"
  | "JOURNAL_REFUSED_INPUT"
  | "JOURNAL_ARCHIVED_FOR_REVIEW";

export type AimHumanReviewOutcome =
  | "PENDING_HUMAN_REVIEW"
  | "HUMAN_REVIEWED_NO_ACTION"
  | "HUMAN_DEFERRED"
  | "HUMAN_REJECTED_THESIS"
  | "HUMAN_CONFIRMED_LEARNING";

export type AimDecisionResultClassification =
  | "PENDING_RESULT"
  | "THESIS_STRENGTHENED"
  | "THESIS_WEAKENED"
  | "CONTRADICTION_CONFIRMED"
  | "RISK_REDUCED"
  | "RISK_INCREASED"
  | "NO_ACTION_TAKEN"
  | "INSUFFICIENT_DATA";

export interface AimDecisionSnapshot {
  decisionId: string;
  createdAt: string;
  departmentOrigin: AimDecisionItem["departmentOrigin"];
  agentOrigin: AimDecisionItem["agentOrigin"];
  signalType: AimDecisionItem["signalType"];
  assetOrSubject: string;
  thesisReference: string;
  evidenceStrength: AimDecisionItem["evidenceStrength"];
  riskClass: AimDecisionItem["riskClass"];
  timingContext: AimDecisionItem["timingContext"];
  urgencyLevel: AimDecisionItem["urgencyLevel"];
  proposedAction: string;
  prohibitedActionFlag: boolean;
  paiSafeStatus: AimPaiSafeDecisionReviewStatus;
  humanReviewRequired: true;
  journalRequired: true;
  finalAuthority: "Human";
}

export interface AimRationaleSnapshot {
  sourceInputs: string[];
  evidenceSummary: string;
  contradictionFlags: string[];
  readinessReasons: string[];
  nextStep: string;
}

export interface AimReviewOutcomePlaceholder {
  reviewOutcome: AimHumanReviewOutcome;
  reviewedAt: "";
  reviewedBy: "";
  humanDecisionNote: "";
  finalAction: "";
}

export interface AimFeedbackLoopInput {
  feedbackId: string;
  journalPacketId: string;
  decisionId: string;
  createdAt: string;
  priorPaiSafeStatus: AimPaiSafeDecisionReviewStatus;
  resultClassification: AimDecisionResultClassification;
  lessonLearned: string;
  decisionImprovementNote: string;
  contradictionUpdate: string;
  nextReviewPrompt: string;
  humanReviewRequired: true;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  finalAction: "";
}

export interface AimJournalPacket {
  journalPacketId: string;
  createdAt: string;
  status: AimJournalPacketStatus;
  decisionSnapshot: AimDecisionSnapshot;
  rationaleSnapshot: AimRationaleSnapshot;
  reviewOutcomePlaceholder: AimReviewOutcomePlaceholder;
  feedbackLoopInput: AimFeedbackLoopInput;
  sourceDecisionInput?: AimStructuredDecisionInput;
  preservationRequired: true;
  humanReviewRequired: true;
  finalAuthority: "Human";
  executionAuthorized: false;
  tradeRecommendation: null;
  financialAdviceProvided: false;
  finalAction: "";
}