import type { AimFeedbackSummaryPacket } from "./aimMemoryReviewContracts.js";
import type { AimProductReadinessAuditPacket } from "./aimProductReadinessContracts.js";
import type { AimShellAdapterPacket } from "./aimShellAdapterContracts.js";
import type { AimManualIntakeUiPacket } from "./aimManualIntakeUiContracts.js";
import type { AimPreviewRecordViewerPacket } from "./aimPreviewRecordViewerContracts.js";
import type { AimWatchlistReviewViewPacket } from "./aimWatchlistReviewViewContracts.js";

export type AimV02DemoAuditStatus =
  | "AIM_V0_2_DEMO_READY"
  | "AIM_V0_2_DEMO_HELD"
  | "AIM_V0_2_DEMO_REFUSED";

export type AimV02DemoAuditSectionKind =
  | "demo_status"
  | "product_readiness"
  | "feedback_summary"
  | "shell_connection"
  | "manual_intake_ui"
  | "preview_record_viewer"
  | "watchlist_review"
  | "learning_loop"
  | "authority_boundary";

export interface AimV02FeedbackDemoAuditInput {
  productReadiness: AimProductReadinessAuditPacket;
  feedbackSummary: AimFeedbackSummaryPacket;
  shellAdapter: AimShellAdapterPacket;
  intakeUi: AimManualIntakeUiPacket;
  previewRecordViewer: AimPreviewRecordViewerPacket;
  watchlistReviewView: AimWatchlistReviewViewPacket;
}

export interface AimV02DemoAuditSection {
  sectionId: string;
  kind: AimV02DemoAuditSectionKind;
  title: string;
  statusLabel: string;
  displayFields: Record<string, string | number | boolean | null>;
  sourceReference: string;
  readOnly: true;
  sourceOnly: true;
  mayMutateFeedback: false;
  mayMutateAudit: false;
  mayMutateDemo: false;
  mayMutateAimOutput: false;
  mayMutateJournal: false;
  mayCreateTruth: false;
  mayApproveDecision: false;
  mayExecuteTrade: false;
  mayProvideFinancialAdvice: false;
  mayUseLiveData: false;
  finalAction: "";
}

export interface AimV02FeedbackDemoAuditPacket {
  demoAuditId: string;
  createdAt: string;
  title: "AIM v0.2 Feedback Summary + Product Demo Audit";
  product: "AIM — AI MarketIntel";
  version: "v0.2-demo-audit";
  status: AimV02DemoAuditStatus;
  sourceProductReadinessAuditId: string;
  sourceFeedbackSummaryId: string;
  sourceShellAdapterId: string;
  sourceIntakeUiId: string;
  sourcePreviewRecordViewerId: string;
  sourceWatchlistReviewViewId: string;
  sections: readonly AimV02DemoAuditSection[];
  sectionCount: number;
  readinessScore: number;
  demoCompletenessScore: number;
  htmlPreview: string;
  demoHash: string;
  readOnly: true;
  deterministic: true;
  controlledDemoOnly: true;
  localOnly: true;
  mayMutateFeedback: false;
  mayMutateAudit: false;
  mayMutateDemo: false;
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

export interface AimV02DemoAuditGovernancePacket {
  governanceId: string;
  createdAt: string;
  sourceDemoAuditId: string;
  checks: Record<string, boolean>;
  status: "DEMO_AUDIT_GOVERNANCE_VERIFIED" | "DEMO_AUDIT_GOVERNANCE_REFUSED";
  refusalReasons: string[];
  finalAuthority: "Human";
  finalAction: "";
}