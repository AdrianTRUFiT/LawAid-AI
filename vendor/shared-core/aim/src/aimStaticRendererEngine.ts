import type {
  AimStaticBrowserVerificationPacket,
  AimStaticPreviewRenderPacket,
  AimStaticRenderStatus,
  AimStaticPanelInput,
  AimStaticRenderedPanel,
  AimStaticRendererInput
} from "./aimStaticRendererContracts.js";

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64) || "static";
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);

  if (Array.isArray(value)) {
    return "[" + value.map((item) => stableStringify(item)).join(",") + "]";
  }

  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  return "{" + entries.map(([key, item]) => JSON.stringify(key) + ":" + stableStringify(item)).join(",") + "}";
}

function simpleDeterministicHash(value: unknown): string {
  const input = stableStringify(value);
  let hash = 2166136261;

  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return "aim_static_hash_" + (hash >>> 0).toString(16).padStart(8, "0");
}

function freezeDeep<T>(value: T): Readonly<T> {
  if (value && typeof value === "object") {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const child = (value as Record<string, unknown>)[key];
      if (child && typeof child === "object" && !Object.isFrozen(child)) {
        freezeDeep(child);
      }
    }
    Object.freeze(value);
  }

  return value as Readonly<T>;
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderDisplayFields(fields: Record<string, string | number | boolean | null>): string {
  const rows = Object.entries(fields)
    .map(([key, value]) => {
      return "<div class=\"aim-field\"><span class=\"aim-field-key\">" +
        escapeHtml(key) +
        "</span><span class=\"aim-field-value\">" +
        escapeHtml(value) +
        "</span></div>";
    })
    .join("");

  return "<section class=\"aim-fields\">" + rows + "</section>";
}

export function mapPreviewStatusToStaticRenderStatus(input: AimStaticRendererInput): AimStaticRenderStatus {
  if (input.status === "PREVIEW_READY" || input.status === "PREVIEW_HELD") return "STATIC_RENDER_READY";
  if (input.status === "PREVIEW_EMPTY") return "STATIC_RENDER_EMPTY";
  if (input.status === "PREVIEW_ARCHIVED") return "STATIC_RENDER_ARCHIVED";
  return "STATIC_RENDER_ERROR";
}

export function renderAimStaticPanel(panel: AimStaticPanelInput): AimStaticRenderedPanel {
  const hiddenCount = panel.hiddenFields.length;

  const html =
    "<article class=\"aim-panel aim-panel-" + escapeHtml(panel.severity) + "\" data-panel-id=\"" + escapeHtml(panel.panelId) + "\">" +
    "<header class=\"aim-panel-header\">" +
    "<p class=\"aim-panel-kind\">" + escapeHtml(panel.kind) + "</p>" +
    "<h2>" + escapeHtml(panel.title) + "</h2>" +
    "<span class=\"aim-status\">" + escapeHtml(panel.statusLabel) + "</span>" +
    "</header>" +
    "<p class=\"aim-summary\">" + escapeHtml(panel.summary) + "</p>" +
    renderDisplayFields(panel.displayFields) +
    "<footer class=\"aim-panel-footer\">" +
    "<span>Read-only</span>" +
    "<span>Human authority required</span>" +
    "<span>Hidden fields: " + escapeHtml(hiddenCount) + "</span>" +
    "</footer>" +
    "</article>";

  return freezeDeep({
    panelId: "aim_static_panel_" + stableIdPart(panel.panelId),
    title: panel.title,
    severity: panel.severity,
    statusLabel: panel.statusLabel,
    html,
    sourcePanelId: panel.panelId,
    readOnly: true,
    mayMutateSource: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAction: ""
  }) as AimStaticRenderedPanel;
}

export function renderAimStaticPreviewHtml(input: AimStaticRendererInput, renderedPanels: readonly AimStaticRenderedPanel[]): string {
  const panelsHtml = renderedPanels.map((panel) => panel.html).join("");

  return "<!doctype html>" +
    "<html lang=\"en\">" +
    "<head>" +
    "<meta charset=\"utf-8\" />" +
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />" +
    "<title>AIM Static Preview</title>" +
    "<style>" +
    "body{margin:0;background:#101216;color:#f6f7fb;font-family:Arial,Helvetica,sans-serif;}" +
    ".aim-shell{max-width:1180px;margin:0 auto;padding:32px;}" +
    ".aim-hero{border:1px solid #2a2f3a;border-radius:20px;padding:24px;background:#151923;margin-bottom:20px;}" +
    ".aim-hero h1{margin:0 0 8px;font-size:32px;}" +
    ".aim-hero p{margin:0;color:#b9c0cf;line-height:1.5;}" +
    ".aim-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px;}" +
    ".aim-panel{border:1px solid #2a2f3a;border-radius:18px;padding:18px;background:#171c26;}" +
    ".aim-panel-success{border-color:#3f7f5f;}" +
    ".aim-panel-warning{border-color:#9f7c35;}" +
    ".aim-panel-refused{border-color:#9f4d4d;}" +
    ".aim-panel-error{border-color:#bb4545;}" +
    ".aim-panel-header{display:flex;gap:12px;align-items:flex-start;justify-content:space-between;}" +
    ".aim-panel-kind{margin:0;color:#8d96a8;font-size:12px;text-transform:uppercase;letter-spacing:.08em;}" +
    ".aim-panel h2{margin:4px 0 0;font-size:18px;}" +
    ".aim-status{font-size:12px;border:1px solid #3a4150;border-radius:999px;padding:6px 8px;color:#dbe2f1;white-space:nowrap;}" +
    ".aim-summary{color:#c6ccda;line-height:1.45;}" +
    ".aim-fields{display:grid;gap:8px;margin-top:12px;}" +
    ".aim-field{display:flex;justify-content:space-between;gap:12px;border-top:1px solid #252b36;padding-top:8px;}" +
    ".aim-field-key{color:#8d96a8;}" +
    ".aim-field-value{color:#ffffff;text-align:right;}" +
    ".aim-panel-footer{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;color:#9da6b8;font-size:12px;}" +
    ".aim-panel-footer span{border:1px solid #2d3441;border-radius:999px;padding:5px 8px;}" +
    "</style>" +
    "</head>" +
    "<body>" +
    "<main class=\"aim-shell\" data-aim-static-preview=\"true\" data-source-preview-hash=\"" + escapeHtml(input.previewHash) + "\">" +
    "<section class=\"aim-hero\">" +
    "<h1>AIM — AI MarketIntel</h1>" +
    "<p>Read-only governed intelligence preview. AIM structures directional clarity before capital, resources, or action moves. Human authority remains final.</p>" +
    "</section>" +
    "<section class=\"aim-grid\">" + panelsHtml + "</section>" +
    "</main>" +
    "</body>" +
    "</html>";
}

export function renderAimStaticPreviewPacket(
  input: AimStaticRendererInput,
  createdAt = "2026-05-14T15:00:00.000Z"
): AimStaticPreviewRenderPacket {
  const renderedPanels = input.panels.map((panel) => renderAimStaticPanel(panel));
  const html = renderAimStaticPreviewHtml(input, renderedPanels);

  return freezeDeep({
    staticRenderId: "aim_static_render_" + stableIdPart(input.previewHash),
    createdAt,
    sourcePreviewHash: input.previewHash,
    status: mapPreviewStatusToStaticRenderStatus(input),
    html,
    renderedPanels,
    panelCount: renderedPanels.length,
    readOnly: true,
    deterministic: true,
    staticOnly: true,
    mayRenderReactUi: false,
    mayMutateState: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimStaticPreviewRenderPacket;
}

export function verifyAimStaticBrowserPreview(
  packet: AimStaticPreviewRenderPacket,
  createdAt = "2026-05-14T15:05:00.000Z"
): AimStaticBrowserVerificationPacket {
  const html = packet.html.toLowerCase();

  const checks: Record<string, boolean> = {
    hasDoctype: html.includes("<!doctype html>"),
    hasHtmlTag: html.includes("<html"),
    hasViewport: html.includes("viewport"),
    hasMainPreviewRoot: html.includes("data-aim-static-preview=\"true\""),
    hasAimBrand: html.includes("aim — ai marketintel") || html.includes("aim &mdash; ai marketintel"),
    hasPanels: packet.panelCount > 0 && html.includes("aim-panel"),
    noButtonControls: !html.includes("<button"),
    noInputControls: !html.includes("<input"),
    noFormControls: !html.includes("<form"),
    noExecuteLanguage: !html.includes("execute trade") && !html.includes("execute order"),
    noBuySellLanguage: !html.includes("buy now") && !html.includes("sell now"),
    noApprovalLanguage: !html.includes("trade approved") && !html.includes("investment approved"),
    noFinancialAdviceLanguage: !html.includes("financial advice"),
    noSoulWriteAuthority: packet.mayWriteSoul === false,
    noMutationAuthority: packet.mayMutateState === false,
    noExecutionAuthority: packet.mayExecuteTrade === false,
    humanAuthorityFinal: packet.finalAuthority === "Human",
    finalActionBlank: packet.finalAction === ""
  };

  const refusalReasons = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([key]) => key);

  return freezeDeep({
    verificationId: "aim_browser_static_verification_" + stableIdPart(packet.staticRenderId),
    createdAt,
    sourceStaticRenderId: packet.staticRenderId,
    sourcePreviewHash: packet.sourcePreviewHash,
    status: refusalReasons.length === 0 ? "BROWSER_STATIC_VERIFIED" : "BROWSER_STATIC_REFUSED",
    checks,
    refusalReasons,
    readOnly: true,
    mayMutateState: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAction: ""
  }) as AimStaticBrowserVerificationPacket;
}

export function getAimStaticRenderHash(packet: AimStaticPreviewRenderPacket): string {
  return simpleDeterministicHash({
    staticRenderId: packet.staticRenderId,
    sourcePreviewHash: packet.sourcePreviewHash,
    status: packet.status,
    panelCount: packet.panelCount,
    html: packet.html
  });
}