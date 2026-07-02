import type { AimProductReadinessAuditPacket } from "./aimProductReadinessContracts.js";
import type { AimShellAdapterPacket } from "./aimShellAdapterContracts.js";
import type { AimManualIntakeUiPacket } from "./aimManualIntakeUiContracts.js";
import type { AimPreviewRecordViewerPacket } from "./aimPreviewRecordViewerContracts.js";
import type { AimWatchlistReviewViewPacket } from "./aimWatchlistReviewViewContracts.js";
import type { AimV02FeedbackDemoAuditPacket } from "./aimFeedbackDemoAuditContracts.js";

export type AimRuntimeRouteId =
  | "manual_intake_ui"
  | "operator_shell"
  | "preview_record_viewer"
  | "watchlist_human_review"
  | "feedback_demo_audit"
  | "product_readiness_audit";

export type AimRuntimeRouteRegistryStatus =
  | "AIM_V0_3_ROUTE_REGISTRY_READY"
  | "AIM_V0_3_ROUTE_REGISTRY_HELD"
  | "AIM_V0_3_ROUTE_REGISTRY_REFUSED";

export type AimRuntimeRouteStatus =
  | "ROUTE_READY"
  | "ROUTE_HELD"
  | "ROUTE_REFUSED";

export interface AimRuntimeRouteRegistryInput {
  productReadiness: AimProductReadinessAuditPacket;
  shellAdapter: AimShellAdapterPacket;
  intakeUi: AimManualIntakeUiPacket;
  previewRecordViewer: AimPreviewRecordViewerPacket;
  watchlistReviewView: AimWatchlistReviewViewPacket;
  feedbackDemoAudit: AimV02FeedbackDemoAuditPacket;
}

export interface AimRuntimeRouteDefinition {
  routeId: AimRuntimeRouteId;
  path: string;
  label: string;
  description: string;
  sourcePacketId: string;
  sourceStatus: string;
  routeStatus: AimRuntimeRouteStatus;
  order: number;
  visible: boolean;
  navigable: boolean;
  readOnly: true;
  sourceOnly: true;
  runtimeAssemblyOnly: true;
  mayMountComponent: false;
  mayMutateAimOutput: false;
  mayMutateJournal: false;
  mayCreateTruth: false;
  mayGovern: false;
  mayApproveDecision: false;
  mayExecuteTrade: false;
  mayProvideFinancialAdvice: false;
  mayUseLiveData: false;
  mayCallExternalApi: false;
  mayWriteSoul: false;
  finalAction: "";
}

export interface AimRuntimeRouteRegistryPacket {
  registryId: string;
  createdAt: string;
  title: "AIM v0.3 Local Runtime Route Registry";
  product: "AIM — AI MarketIntel";
  version: "v0.3-runtime-route-registry-sprint1";
  status: AimRuntimeRouteRegistryStatus;
  routes: readonly AimRuntimeRouteDefinition[];
  routeCount: number;
  readyRouteCount: number;
  heldRouteCount: number;
  refusedRouteCount: number;
  defaultRouteId: AimRuntimeRouteId;
  registryHash: string;
  readOnly: true;
  deterministic: true;
  localOnly: true;
  runtimeAssemblyOnly: true;
  mayMountComponents: false;
  mayRedesignUi: false;
  mayMutateAimOutput: false;
  mayMutateJournal: false;
  mayCreateTruth: false;
  mayGovern: false;
  mayApproveDecision: false;
  mayExecuteTrade: false;
  mayProvideFinancialAdvice: false;
  mayUseLiveData: false;
  mayCallExternalApi: false;
  mayWriteSoul: false;
  humanReviewRequired: true;
  finalAuthority: "Human";
  finalAction: "";
}

export interface AimRuntimeRouteRegistryGovernancePacket {
  governanceId: string;
  createdAt: string;
  sourceRegistryId: string;
  checks: Record<string, boolean>;
  status: "ROUTE_REGISTRY_GOVERNANCE_VERIFIED" | "ROUTE_REGISTRY_GOVERNANCE_REFUSED";
  refusalReasons: string[];
  finalAuthority: "Human";
  finalAction: "";
}