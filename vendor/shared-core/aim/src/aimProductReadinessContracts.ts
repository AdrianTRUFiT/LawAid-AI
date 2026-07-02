import type { AimOperatorEndToEndFlowPacket } from "./aimOperatorWorkflowContracts.js";
import type {
  AimFeedbackSummaryPacket,
  AimHumanReviewOutcomePacket,
  AimLocalRecordPacket,
  AimWatchlistThesisItem
} from "./aimMemoryReviewContracts.js";

export type AimProductReadinessStatus =
  | "AIM_V0_1_LOCAL_READY"
  | "AIM_V0_1_HELD_FOR_REPAIR"
  | "AIM_V0_1_REFUSED_FOR_AUTHORITY_DRIFT";

export type AimProductReadinessCheckKey =
  | "manualIntakeVerified"
  | "decisionQueueVerified"
  | "paiSafeReviewVerified"
  | "journalVerified"
  | "fixtureExportVerified"
  | "previewHarnessVerified"
  | "staticRenderVerified"
  | "browserVerificationVerified"
  | "localRecordVerified"
  | "watchlistVerified"
  | "humanReviewVerified"
  | "feedbackSummaryVerified"
  | "readOnlyIntegrityVerified"
  | "localOnlyVerified"
  | "humanAuthorityVerified"
  | "noLiveDataVerified"
  | "noExternalApiVerified"
  | "noMutationVerified"
  | "noExecutionVerified"
  | "noInvestmentApprovalVerified"
  | "noFinancialAdviceVerified"
  | "noSoulWriteVerified"
  | "finalActionBlankVerified";

export interface AimProductReadinessAuditInput {
  flow: AimOperatorEndToEndFlowPacket;
  localRecord: AimLocalRecordPacket;
  watchlistItem: AimWatchlistThesisItem;
  humanReviews: AimHumanReviewOutcomePacket[];
  feedbackSummary: AimFeedbackSummaryPacket;
}

export interface AimProductReadinessGate {
  gateId: string;
  title: string;
  passed: boolean;
  notes: string[];
}

export interface AimProductReadinessAuditPacket {
  auditId: string;
  createdAt: string;
  product: "AIM — AI MarketIntel";
  version: "v0.1-local";
  status: AimProductReadinessStatus;
  checks: Record<AimProductReadinessCheckKey, boolean>;
  gates: readonly AimProductReadinessGate[];
  readinessScore: number;
  passedCheckCount: number;
  totalCheckCount: number;
  refusalReasons: string[];
  nextRecommendedMove: string;
  localWorkingProduct: boolean;
  readOnly: true;
  deterministic: true;
  localOnly: true;
  mayUseLiveData: false;
  mayCallExternalApi: false;
  mayMutateState: false;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  mayWriteSoul: false;
  humanReviewRequired: true;
  finalAuthority: "Human";
  finalAction: "";
}