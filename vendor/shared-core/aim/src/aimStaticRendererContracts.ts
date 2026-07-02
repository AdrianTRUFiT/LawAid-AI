import type {
  AimPreviewHarnessPacket,
  AimPreviewPanelPacket,
  AimPreviewSeverity
} from "./aimPreviewContracts.js";

export type AimStaticRenderStatus =
  | "STATIC_RENDER_READY"
  | "STATIC_RENDER_EMPTY"
  | "STATIC_RENDER_ARCHIVED"
  | "STATIC_RENDER_ERROR";

export interface AimStaticRenderedPanel {
  panelId: string;
  title: string;
  severity: AimPreviewSeverity;
  statusLabel: string;
  html: string;
  sourcePanelId: string;
  readOnly: true;
  mayMutateSource: false;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  mayWriteSoul: false;
  finalAction: "";
}

export interface AimStaticPreviewRenderPacket {
  staticRenderId: string;
  createdAt: string;
  sourcePreviewHash: string;
  status: AimStaticRenderStatus;
  html: string;
  renderedPanels: readonly AimStaticRenderedPanel[];
  panelCount: number;
  readOnly: true;
  deterministic: true;
  staticOnly: true;
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

export interface AimStaticBrowserVerificationPacket {
  verificationId: string;
  createdAt: string;
  sourceStaticRenderId: string;
  sourcePreviewHash: string;
  status: "BROWSER_STATIC_VERIFIED" | "BROWSER_STATIC_REFUSED";
  checks: Record<string, boolean>;
  refusalReasons: string[];
  readOnly: true;
  mayMutateState: false;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  mayWriteSoul: false;
  finalAction: "";
}

export type AimStaticRendererInput = AimPreviewHarnessPacket;

export type AimStaticPanelInput = AimPreviewPanelPacket;