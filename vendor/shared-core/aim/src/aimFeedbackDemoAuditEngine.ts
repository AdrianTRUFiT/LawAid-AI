import type {
  AimV02DemoAuditGovernancePacket,
  AimV02DemoAuditSection,
  AimV02DemoAuditSectionKind,
  AimV02DemoAuditStatus,
  AimV02FeedbackDemoAuditInput,
  AimV02FeedbackDemoAuditPacket
} from "./aimFeedbackDemoAuditContracts.js";

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 72) || "demo_audit";
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map((item) => stableStringify(item)).join(",") + "]";
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
  return "aim_demo_hash_" + (hash >>> 0).toString(16).padStart(8, "0");
}

function freezeDeep<T>(value: T): Readonly<T> {
  if (value && typeof value === "object") {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const child = (value as Record<string, unknown>)[key];
      if (child && typeof child === "object" && !Object.isFrozen(child)) freezeDeep(child);
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

function section(
  kind: AimV02DemoAuditSectionKind,
  title: string,
  statusLabel: string,
  sourceReference: string,
  displayFields: Record<string, string | number | boolean | null>
): AimV02DemoAuditSection {
  return freezeDeep({
    sectionId: "aim_demo_audit_section_" + stableIdPart(kind + "_" + title),
    kind,
    title,
    statusLabel,
    displayFields,
    sourceReference,
    readOnly: true,
    sourceOnly: true,
    mayMutateFeedback: false,
    mayMutateAudit: false,
    mayMutateDemo: false,
    mayMutateAimOutput: false,
    mayMutateJournal: false,
    mayCreateTruth: false,
    mayApproveDecision: false,
    mayExecuteTrade: false,
    mayProvideFinancialAdvice: false,
    mayUseLiveData: false,
    finalAction: ""
  }) as AimV02DemoAuditSection;
}

export function deriveAimV02DemoAuditStatus(input: AimV02FeedbackDemoAuditInput): AimV02DemoAuditStatus {
  const ready =
    input.productReadiness.status === "AIM_V0_1_LOCAL_READY" &&
    input.shellAdapter.status === "AIM_SHELL_CONNECTED" &&
    input.intakeUi.uiStatus === "INTAKE_UI_READY" &&
    input.previewRecordViewer.status === "VIEWER_READY" &&
    input.watchlistReviewView.status === "WATCHLIST_REVIEW_READY" &&
    input.feedbackSummary.reviewCount > 0;

  if (ready) return "AIM_V0_2_DEMO_READY";

  const refused =
    input.shellAdapter.status === "AIM_SHELL_REFUSED" ||
    input.previewRecordViewer.status === "VIEWER_REFUSED" ||
    input.watchlistReviewView.status === "WATCHLIST_REVIEW_REFUSED";

  return refused ? "AIM_V0_2_DEMO_REFUSED" : "AIM_V0_2_DEMO_HELD";
}

export function calculateAimV02DemoCompletenessScore(input: AimV02FeedbackDemoAuditInput): number {
  const checks = [
    input.productReadiness.localWorkingProduct === true,
    input.feedbackSummary.reviewCount > 0,
    input.feedbackSummary.latestLessons.length > 0,
    input.feedbackSummary.improvementPrompts.length > 0,
    input.shellAdapter.status === "AIM_SHELL_CONNECTED",
    input.intakeUi.uiStatus === "INTAKE_UI_READY",
    input.previewRecordViewer.status === "VIEWER_READY",
    input.watchlistReviewView.status === "WATCHLIST_REVIEW_READY",
    input.shellAdapter.finalAction === "",
    input.intakeUi.finalAction === "",
    input.previewRecordViewer.finalAction === "",
    input.watchlistReviewView.finalAction === ""
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function renderAimV02FeedbackDemoAuditHtml(packet: Omit<AimV02FeedbackDemoAuditPacket, "htmlPreview">): string {
  const sections = packet.sections.map((item) => {
    const fields = Object.entries(item.displayFields).map(([key, value]) => {
      return "<div class=\"aim-demo-field\"><span>" + escapeHtml(key) + "</span><strong>" + escapeHtml(value) + "</strong></div>";
    }).join("");

    return "<article class=\"aim-demo-card\" data-section-kind=\"" + escapeHtml(item.kind) + "\">" +
      "<p>" + escapeHtml(item.kind) + "</p>" +
      "<h2>" + escapeHtml(item.title) + "</h2>" +
      "<div class=\"aim-demo-status\">" + escapeHtml(item.statusLabel) + "</div>" +
      "<small>" + escapeHtml(item.sourceReference) + "</small>" +
      "<section>" + fields + "</section>" +
      "</article>";
  }).join("");

  return "<main data-aim-v02-demo-audit=\"true\">" +
    "<header><h1>AIM v0.2 Feedback Summary + Product Demo Audit</h1><p>Read-only demo audit. Feedback is summarized for human review only.</p></header>" +
    "<section class=\"aim-demo-grid\">" + sections + "</section>" +
    "</main>";
}

export function buildAimV02FeedbackDemoAuditPacket(
  input: AimV02FeedbackDemoAuditInput,
  createdAt = "2026-05-14T23:00:00.000Z"
): AimV02FeedbackDemoAuditPacket {
  const status = deriveAimV02DemoAuditStatus(input);
  const demoCompletenessScore = calculateAimV02DemoCompletenessScore(input);

  const sections = [
    section("demo_status", "Demo Status", status, input.productReadiness.auditId, {
      product: "AIM — AI MarketIntel",
      version: "v0.2-demo-audit",
      demoStatus: status,
      demoCompletenessScore
    }),
    section("product_readiness", "Product Readiness", input.productReadiness.status, input.productReadiness.auditId, {
      readinessScore: input.productReadiness.readinessScore,
      passedCheckCount: input.productReadiness.passedCheckCount,
      totalCheckCount: input.productReadiness.totalCheckCount,
      localWorkingProduct: input.productReadiness.localWorkingProduct
    }),
    section("feedback_summary", "Feedback Summary", input.feedbackSummary.trend, input.feedbackSummary.summaryId, {
      recordCount: input.feedbackSummary.recordCount,
      reviewCount: input.feedbackSummary.reviewCount,
      watchlistCount: input.feedbackSummary.watchlistCount,
      trend: input.feedbackSummary.trend
    }),
    section("shell_connection", "Shell Connection", input.shellAdapter.status, input.shellAdapter.shellAdapterId, {
      shellAdapterId: input.shellAdapter.shellAdapterId,
      sectionCount: input.shellAdapter.sectionCount,
      controlledVisibilityOnly: input.shellAdapter.controlledVisibilityOnly,
      preservesOriginalValues: input.shellAdapter.preservesOriginalValues
    }),
    section("manual_intake_ui", "Manual Intake UI", input.intakeUi.uiStatus, input.intakeUi.uiId, {
      uiId: input.intakeUi.uiId,
      intakeStatus: input.intakeUi.intakeStatus,
      sectionCount: input.intakeUi.sectionCount,
      controlledInputOnly: input.intakeUi.controlledInputOnly
    }),
    section("preview_record_viewer", "Preview + Record Viewer", input.previewRecordViewer.status, input.previewRecordViewer.viewerId, {
      viewerId: input.previewRecordViewer.viewerId,
      sectionCount: input.previewRecordViewer.sectionCount,
      sourceRecordId: input.previewRecordViewer.sourceRecordId,
      sourceJournalPacketId: input.previewRecordViewer.sourceJournalPacketId
    }),
    section("watchlist_review", "Watchlist + Human Review", input.watchlistReviewView.status, input.watchlistReviewView.viewId, {
      viewId: input.watchlistReviewView.viewId,
      sectionCount: input.watchlistReviewView.sectionCount,
      sourceWatchlistId: input.watchlistReviewView.sourceWatchlistId,
      sourceReviewId: input.watchlistReviewView.sourceReviewId
    }),
    section("learning_loop", "Learning Loop", input.feedbackSummary.trend, input.feedbackSummary.summaryId, {
      latestLessonCount: input.feedbackSummary.latestLessons.length,
      improvementPromptCount: input.feedbackSummary.improvementPrompts.length,
      contradictionUpdateCount: input.feedbackSummary.contradictionUpdates.length,
      reviewCount: input.feedbackSummary.reviewCount
    }),
    section("authority_boundary", "Authority Boundary", "NO_EXECUTION_AUTHORITY", input.productReadiness.auditId, {
      finalAuthority: "Human",
      finalAction: "",
      actionBoundary: "Demo and audit only. No approval, advice, execution, mutation, or live data authority.",
      humanReviewRequired: true
    })
  ];

  const demoHash = simpleDeterministicHash({
    productReadinessAuditId: input.productReadiness.auditId,
    feedbackSummaryId: input.feedbackSummary.summaryId,
    shellAdapterId: input.shellAdapter.shellAdapterId,
    intakeUiId: input.intakeUi.uiId,
    previewRecordViewerId: input.previewRecordViewer.viewerId,
    watchlistReviewViewId: input.watchlistReviewView.viewId,
    status,
    demoCompletenessScore
  });

  const base = freezeDeep({
    demoAuditId: "aim_v02_demo_audit_" + stableIdPart(demoHash),
    createdAt,
    title: "AIM v0.2 Feedback Summary + Product Demo Audit",
    product: "AIM — AI MarketIntel",
    version: "v0.2-demo-audit",
    status,
    sourceProductReadinessAuditId: input.productReadiness.auditId,
    sourceFeedbackSummaryId: input.feedbackSummary.summaryId,
    sourceShellAdapterId: input.shellAdapter.shellAdapterId,
    sourceIntakeUiId: input.intakeUi.uiId,
    sourcePreviewRecordViewerId: input.previewRecordViewer.viewerId,
    sourceWatchlistReviewViewId: input.watchlistReviewView.viewId,
    sections,
    sectionCount: sections.length,
    readinessScore: input.productReadiness.readinessScore,
    demoCompletenessScore,
    htmlPreview: "",
    demoHash,
    readOnly: true,
    deterministic: true,
    controlledDemoOnly: true,
    localOnly: true,
    mayMutateFeedback: false,
    mayMutateAudit: false,
    mayMutateDemo: false,
    mayMutateAimOutput: false,
    mayMutateJournal: false,
    mayCreateTruth: false,
    mayGovern: false,
    mayApproveDecision: false,
    mayExecuteTrade: false,
    mayProvideFinancialAdvice: false,
    mayUseLiveData: false,
    mayCallExternalApi: false,
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: ""
  }) as Omit<AimV02FeedbackDemoAuditPacket, "htmlPreview">;

  return freezeDeep({
    ...base,
    htmlPreview: renderAimV02FeedbackDemoAuditHtml(base)
  }) as AimV02FeedbackDemoAuditPacket;
}

export function verifyAimV02FeedbackDemoAuditGovernance(
  packet: AimV02FeedbackDemoAuditPacket
): AimV02DemoAuditGovernancePacket {
  const checks: Record<string, boolean> = {
    readOnly: packet.readOnly === true,
    deterministic: packet.deterministic === true,
    controlledDemoOnly: packet.controlledDemoOnly === true,
    localOnly: packet.localOnly === true,
    productNamePreserved: packet.product === "AIM — AI MarketIntel",
    v02DemoVersionLocked: packet.version === "v0.2-demo-audit",
    readinessVisible: packet.sourceProductReadinessAuditId.length > 0,
    feedbackVisible: packet.sourceFeedbackSummaryId.length > 0,
    shellVisible: packet.sourceShellAdapterId.length > 0,
    intakeVisible: packet.sourceIntakeUiId.length > 0,
    viewerVisible: packet.sourcePreviewRecordViewerId.length > 0,
    reviewVisible: packet.sourceWatchlistReviewViewId.length > 0,
    noFeedbackMutation: packet.mayMutateFeedback === false,
    noAuditMutation: packet.mayMutateAudit === false,
    noDemoMutation: packet.mayMutateDemo === false,
    noAimOutputMutation: packet.mayMutateAimOutput === false,
    noJournalMutation: packet.mayMutateJournal === false,
    noTruthCreation: packet.mayCreateTruth === false,
    noGovernanceAuthority: packet.mayGovern === false,
    noDecisionApproval: packet.mayApproveDecision === false,
    noTradeExecution: packet.mayExecuteTrade === false,
    noFinancialAdvice: packet.mayProvideFinancialAdvice === false,
    noLiveData: packet.mayUseLiveData === false,
    noExternalApi: packet.mayCallExternalApi === false,
    humanAuthorityFinal: packet.finalAuthority === "Human",
    finalActionBlank: packet.finalAction === "",
    htmlRootPresent: packet.htmlPreview.includes("data-aim-v02-demo-audit=\"true\""),
    sectionsReadOnly: packet.sections.every((item) =>
      item.readOnly === true &&
      item.sourceOnly === true &&
      item.mayMutateFeedback === false &&
      item.mayMutateAudit === false &&
      item.mayMutateDemo === false &&
      item.mayMutateAimOutput === false &&
      item.mayMutateJournal === false &&
      item.mayCreateTruth === false &&
      item.mayExecuteTrade === false &&
      item.mayApproveDecision === false &&
      item.mayProvideFinancialAdvice === false &&
      item.mayUseLiveData === false &&
      item.finalAction === ""
    )
  };

  const refusalReasons = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([key]) => key);

  return freezeDeep({
    governanceId: "aim_v02_demo_audit_governance_" + stableIdPart(packet.demoAuditId),
    createdAt: "2026-05-14T23:05:00.000Z",
    sourceDemoAuditId: packet.demoAuditId,
    checks,
    status: refusalReasons.length === 0 ? "DEMO_AUDIT_GOVERNANCE_VERIFIED" : "DEMO_AUDIT_GOVERNANCE_REFUSED",
    refusalReasons,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimV02DemoAuditGovernancePacket;
}