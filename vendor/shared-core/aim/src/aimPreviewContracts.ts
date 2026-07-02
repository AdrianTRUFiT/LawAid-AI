import type {
  AimDecisionFixturePacket,
  AimFixtureExportPacket,
  AimFixtureRole,
  AimJournalFixturePacket
} from "./aimFixtureContracts.js";

export type AimPreviewHarnessStatus =
  | "PREVIEW_READY"
  | "PREVIEW_HELD"
  | "PREVIEW_ARCHIVED"
  | "PREVIEW_EMPTY"
  | "PREVIEW_ERROR";

export type AimPreviewPanelKind =
  | "manifest_summary"
  | "decision_panel"
  | "journal_panel"
  | "queue_summary_panel"
  | "empty_state_panel"
  | "error_state_panel";

export type AimPreviewSeverity =
  | "neutral"
  | "success"
  | "warning"
  | "refused"
  | "error";

export interface AimPreviewPanelPacket {
  panelId: string;
  kind: AimPreviewPanelKind;
  role: AimFixtureRole;
  title: string;
  statusLabel: string;
  severity: AimPreviewSeverity;
  summary: string;
  displayFields: Record<string, string | number | boolean | null>;
  hiddenFields: string[];
  sourceFixtureId: string;
  readOnly: true;
  mayRenderReactUi: false;
  mayMutateSource: false;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  mayWriteSoul: false;
  finalAction: "";
}

export interface AimPreviewHarnessPacket {
  previewHarnessId: string;
  createdAt: string;
  role: AimFixtureRole;
  sourceExportHash: string;
  status: AimPreviewHarnessStatus;
  panels: readonly AimPreviewPanelPacket[];
  panelCount: number;
  emptyState: boolean;
  errorState: boolean;
  previewHash: string;
  readOnly: true;
  deterministic: true;
  mayRenderReactUi: false;
  mayMutateState: false;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  mayWriteSoul: false;
  humanReviewRequired: true;
  finalAuthority: "Human";
  finalAction: "";
}

export interface AimPreviewHarnessErrorInput {
  role: AimFixtureRole;
  createdAt: string;
  sourceExportHash: string;
  errorCode: string;
  errorMessage: string;
}