import type { AimOperatorEndToEndFlowPacket } from "./aimOperatorWorkflowContracts.js";
import type { AimLocalRecordPacket } from "./aimMemoryReviewContracts.js";
import type { AimShellAdapterPacket } from "./aimShellAdapterContracts.js";
import type { AimStaticPreviewRenderPacket } from "./aimStaticRendererContracts.js";

export type AimPreviewRecordViewerStatus =
  | "VIEWER_READY"
  | "VIEWER_HELD"
  | "VIEWER_REFUSED";

export type AimPreviewRecordViewerSectionKind =
  | "viewer_status"
  | "static_preview"
  | "local_record"
  | "journal_reference"
  | "decision_snapshot"
  | "pai_safe_state"
  | "record_path"
  | "human_review_boundary";

export interface AimPreviewRecordViewerInput {
  flow: AimOperatorEndToEndFlowPacket;
  localRecord: AimLocalRecordPacket;
  shellAdapter: AimShellAdapterPacket;
}

export interface AimPreviewRecordViewerSection {
  sectionId: string;
  kind: AimPreviewRecordViewerSectionKind;
  title: string;
  statusLabel: string;
  displayFields: Record<string, string | number | boolean | null>;
  sourceReference: string;
  readOnly: true;
  sourceOnly: true;
  mayMutatePreview: false;
  mayMutateRecord: false;
  mayMutateJournal: false;
  mayCreateTruth: false;
  mayExecuteTrade: false;
  mayApproveDecision: false;
  mayProvideFinancialAdvice: false;
  mayUseLiveData: false;
  finalAction: "";
}

export interface AimPreviewRecordViewerPacket {
  viewerId: string;
  createdAt: string;
  title: "AIM Preview + Record Viewer";
  status: AimPreviewRecordViewerStatus;
  sourceFlowId: string;
  sourceFlowHash: string;
  sourceShellAdapterId: string;
  sourceRecordId: string;
  sourceDecisionId: string;
  sourceJournalPacketId: string;
  sourceStaticRenderId: string;
  sourcePreviewHash: string;
  sections: readonly AimPreviewRecordViewerSection[];
  sectionCount: number;
  htmlPreview: string;
  viewerHash: string;
  readOnly: true;
  deterministic: true;
  controlledVisibilityOnly: true;
  localOnly: true;
  mayMutatePreview: false;
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

export interface AimPreviewRecordViewerGovernancePacket {
  governanceId: string;
  createdAt: string;
  sourceViewerId: string;
  checks: Record<string, boolean>;
  status: "VIEWER_GOVERNANCE_VERIFIED" | "VIEWER_GOVERNANCE_REFUSED";
  refusalReasons: string[];
  finalAuthority: "Human";
  finalAction: "";
}