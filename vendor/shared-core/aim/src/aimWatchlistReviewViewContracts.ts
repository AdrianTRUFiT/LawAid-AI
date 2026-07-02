import type {
  AimHumanReviewOutcomePacket,
  AimLocalRecordPacket,
  AimWatchlistThesisItem
} from "./aimMemoryReviewContracts.js";
import type { AimPreviewRecordViewerPacket } from "./aimPreviewRecordViewerContracts.js";

export type AimWatchlistReviewViewStatus =
  | "WATCHLIST_REVIEW_READY"
  | "WATCHLIST_REVIEW_HELD"
  | "WATCHLIST_REVIEW_REFUSED";

export type AimWatchlistReviewSectionKind =
  | "watchlist_status"
  | "thesis_continuity"
  | "latest_record"
  | "human_review_outcome"
  | "lesson_learned"
  | "decision_improvement"
  | "contradiction_update"
  | "next_review_prompt"
  | "authority_boundary";

export interface AimWatchlistReviewViewInput {
  watchlistItem: AimWatchlistThesisItem;
  localRecord: AimLocalRecordPacket;
  reviewOutcome: AimHumanReviewOutcomePacket;
  viewerPacket?: AimPreviewRecordViewerPacket;
}

export interface AimWatchlistReviewSection {
  sectionId: string;
  kind: AimWatchlistReviewSectionKind;
  title: string;
  statusLabel: string;
  displayFields: Record<string, string | number | boolean | null>;
  sourceReference: string;
  readOnly: true;
  sourceOnly: true;
  mayMutateWatchlist: false;
  mayMutateReview: false;
  mayMutateRecord: false;
  mayMutateJournal: false;
  mayCreateTruth: false;
  mayApproveDecision: false;
  mayExecuteTrade: false;
  mayProvideFinancialAdvice: false;
  mayUseLiveData: false;
  finalAction: "";
}

export interface AimWatchlistReviewViewPacket {
  viewId: string;
  createdAt: string;
  title: "AIM Watchlist + Human Review View";
  status: AimWatchlistReviewViewStatus;
  sourceWatchlistId: string;
  sourceRecordId: string;
  sourceReviewId: string;
  sourceDecisionId: string;
  sourceViewerId: string;
  sections: readonly AimWatchlistReviewSection[];
  sectionCount: number;
  htmlPreview: string;
  viewHash: string;
  readOnly: true;
  deterministic: true;
  controlledVisibilityOnly: true;
  localOnly: true;
  mayMutateWatchlist: false;
  mayMutateReview: false;
  mayMutateRecord: false;
  mayMutateJournal: false;
  mayMutateAimOutput: false;
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

export interface AimWatchlistReviewGovernancePacket {
  governanceId: string;
  createdAt: string;
  sourceViewId: string;
  checks: Record<string, boolean>;
  status: "WATCHLIST_REVIEW_GOVERNANCE_VERIFIED" | "WATCHLIST_REVIEW_GOVERNANCE_REFUSED";
  refusalReasons: string[];
  finalAuthority: "Human";
  finalAction: "";
}