import type { AimOperatorEndToEndFlowPacket } from "./aimOperatorWorkflowContracts.js";
import type {
  AimFeedbackSummaryPacket,
  AimLocalRecordPacket,
  AimWatchlistThesisItem
} from "./aimMemoryReviewContracts.js";

export type AimShellConnectionStatus =
  | "AIM_SHELL_CONNECTED"
  | "AIM_SHELL_HELD"
  | "AIM_SHELL_REFUSED";

export type AimShellSectionKind =
  | "aim_status"
  | "decision_queue"
  | "pai_safe_review"
  | "refusal_hold_reasons"
  | "evidence_summary"
  | "risk_contradiction_flags"
  | "human_review"
  | "journal_reference"
  | "next_operator_action";

export interface AimShellAdapterInput {
  flow: AimOperatorEndToEndFlowPacket;
  localRecord?: AimLocalRecordPacket;
  watchlistItem?: AimWatchlistThesisItem;
  feedbackSummary?: AimFeedbackSummaryPacket;
}

export interface AimShellDisplaySection {
  sectionId: string;
  kind: AimShellSectionKind;
  title: string;
  statusLabel: string;
  displayFields: Record<string, string | number | boolean | null>;
  readOnly: true;
  sourceOnly: true;
  mayMutateSource: false;
  mayMutateJournal: false;
  mayExecuteTrade: false;
  mayApproveDecision: false;
  mayProvideFinancialAdvice: false;
  mayUseLiveData: false;
  finalAction: "";
}

export interface AimShellAdapterPacket {
  shellAdapterId: string;
  createdAt: string;
  sourceFlowId: string;
  sourceFlowHash: string;
  sourceDecisionId: string;
  sourceJournalPacketId: string;
  status: AimShellConnectionStatus;
  product: "AIM — AI MarketIntel";
  version: "v0.2-shell-sprint1";
  sections: readonly AimShellDisplaySection[];
  sectionCount: number;
  shellHash: string;
  readOnly: true;
  deterministic: true;
  controlledVisibilityOnly: true;
  localOnly: true;
  preservesOriginalValues: true;
  mayMutateAimOutput: false;
  mayMutateJournal: false;
  mayCreateTruth: false;
  mayGovern: false;
  mayApproveDecision: false;
  mayExecuteTrade: false;
  mayProvideFinancialAdvice: false;
  mayUseLiveData: false;
  mayCallExternalApi: false;
  humanReviewRequired: true;
  finalAuthority: "Human";
  finalAction: "";
}

export interface AimLocalOperatorViewPacket {
  viewId: string;
  createdAt: string;
  sourceShellAdapterId: string;
  title: "AIM — AI MarketIntel";
  subtitle: string;
  shellStatus: AimShellConnectionStatus;
  visibleSections: readonly AimShellDisplaySection[];
  htmlPreview: string;
  readOnly: true;
  deterministic: true;
  minimalView: true;
  mayRedesignDashboard: false;
  mayMutateAimOutput: false;
  mayMutateJournal: false;
  mayExecuteTrade: false;
  mayApproveDecision: false;
  mayProvideFinancialAdvice: false;
  mayUseLiveData: false;
  humanReviewRequired: true;
  finalAuthority: "Human";
  finalAction: "";
}