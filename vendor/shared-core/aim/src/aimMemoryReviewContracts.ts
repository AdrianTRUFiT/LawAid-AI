import type { AimOperatorEndToEndFlowPacket } from "./aimOperatorWorkflowContracts.js";
import type { AimPaiSafeDecisionReviewStatus } from "./aimDecisionQueueContracts.js";
import type { AimJournalPacketStatus, AimDecisionResultClassification } from "./aimJournalContracts.js";

export type AimLocalRecordStatus =
  | "LOCAL_RECORD_READY"
  | "LOCAL_RECORD_HELD"
  | "LOCAL_RECORD_ARCHIVED"
  | "LOCAL_RECORD_REFUSED";

export type AimWatchlistStatus =
  | "WATCHLIST_ACTIVE"
  | "WATCHLIST_HELD"
  | "WATCHLIST_ARCHIVED"
  | "WATCHLIST_NEEDS_REVIEW";

export type AimHumanReviewDecision =
  | "HUMAN_CONFIRMED_LEARNING"
  | "HUMAN_REVIEWED_NO_ACTION"
  | "HUMAN_DEFERRED"
  | "HUMAN_REJECTED_THESIS";

export type AimFeedbackTrend =
  | "IMPROVING_SIGNAL_DISCIPLINE"
  | "THESIS_STRENGTHENING"
  | "THESIS_WEAKENING"
  | "RISK_INCREASING"
  | "RISK_REDUCING"
  | "INSUFFICIENT_HISTORY";

export interface AimLocalRecordPacket {
  recordId: string;
  createdAt: string;
  sourceFlowId: string;
  sourceDraftId: string;
  decisionId: string;
  journalPacketId: string;
  flowHash: string;
  paiSafeStatus: AimPaiSafeDecisionReviewStatus;
  journalStatus: AimJournalPacketStatus;
  recordStatus: AimLocalRecordStatus;
  assetOrSubject: string;
  thesisReference: string;
  evidenceStrength: string;
  riskClass: string;
  timingContext: string;
  localRecordPath: string;
  readOnly: true;
  deterministic: true;
  localOnly: true;
  preservationRequired: true;
  humanReviewRequired: true;
  mayWriteSoul: false;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  mayMutateSource: false;
  finalAuthority: "Human";
  finalAction: "";
}

export interface AimWatchlistThesisItem {
  watchlistId: string;
  createdAt: string;
  assetOrSubject: string;
  thesisReference: string;
  latestRecordId: string;
  latestPaiSafeStatus: AimPaiSafeDecisionReviewStatus;
  latestJournalStatus: AimJournalPacketStatus;
  evidenceStrength: string;
  riskClass: string;
  timingContext: string;
  reviewCount: number;
  recordCount: number;
  status: AimWatchlistStatus;
  lastReviewedAt: string;
  thesisNote: string;
  contradictionNote: string;
  readOnly: true;
  localOnly: true;
  humanReviewRequired: true;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  mayWriteSoul: false;
  finalAuthority: "Human";
  finalAction: "";
}

export interface AimHumanReviewOutcomePacket {
  reviewId: string;
  createdAt: string;
  reviewer: "Human";
  sourceRecordId: string;
  sourceDecisionId: string;
  reviewDecision: AimHumanReviewDecision;
  resultClassification: AimDecisionResultClassification;
  humanDecisionNote: string;
  lessonLearned: string;
  decisionImprovementNote: string;
  contradictionUpdate: string;
  nextReviewPrompt: string;
  readOnly: true;
  localOnly: true;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  mayWriteSoul: false;
  finalAuthority: "Human";
  finalAction: "";
}

export interface AimFeedbackSummaryPacket {
  summaryId: string;
  createdAt: string;
  recordCount: number;
  reviewCount: number;
  watchlistCount: number;
  trend: AimFeedbackTrend;
  resultClassificationCounts: Record<AimDecisionResultClassification, number>;
  latestLessons: string[];
  improvementPrompts: string[];
  contradictionUpdates: string[];
  readOnly: true;
  deterministic: true;
  localOnly: true;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  mayWriteSoul: false;
  finalAuthority: "Human";
  finalAction: "";
}