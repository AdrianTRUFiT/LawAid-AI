import type {
  AimPreviewRecordViewerGovernancePacket,
  AimPreviewRecordViewerInput,
  AimPreviewRecordViewerPacket,
  AimPreviewRecordViewerSection,
  AimPreviewRecordViewerSectionKind,
  AimPreviewRecordViewerStatus
} from "./aimPreviewRecordViewerContracts.js";

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 72) || "viewer";
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
  return "aim_viewer_hash_" + (hash >>> 0).toString(16).padStart(8, "0");
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
  kind: AimPreviewRecordViewerSectionKind,
  title: string,
  statusLabel: string,
  sourceReference: string,
  displayFields: Record<string, string | number | boolean | null>
): AimPreviewRecordViewerSection {
  return freezeDeep({
    sectionId: "aim_viewer_section_" + stableIdPart(kind + "_" + title),
    kind,
    title,
    statusLabel,
    displayFields,
    sourceReference,
    readOnly: true,
    sourceOnly: true,
    mayMutatePreview: false,
    mayMutateRecord: false,
    mayMutateJournal: false,
    mayCreateTruth: false,
    mayExecuteTrade: false,
    mayApproveDecision: false,
    mayProvideFinancialAdvice: false,
    mayUseLiveData: false,
    finalAction: ""
  }) as AimPreviewRecordViewerSection;
}

export function deriveAimPreviewRecordViewerStatus(input: AimPreviewRecordViewerInput): AimPreviewRecordViewerStatus {
  if (input.flow.status === "FLOW_REFUSED_INPUT" || input.localRecord.recordStatus === "LOCAL_RECORD_REFUSED") return "VIEWER_REFUSED";
  if (!input.flow.staticRender || !input.flow.journalPacket || !input.flow.decisionItem) return "VIEWER_HELD";
  return "VIEWER_READY";
}

export function renderAimPreviewRecordViewerHtml(packet: Omit<AimPreviewRecordViewerPacket, "htmlPreview">): string {
  const sections = packet.sections.map((item) => {
    const fields = Object.entries(item.displayFields).map(([key, value]) => {
      return "<div class=\"aim-viewer-field\"><span>" + escapeHtml(key) + "</span><strong>" + escapeHtml(value) + "</strong></div>";
    }).join("");

    return "<article class=\"aim-viewer-card\" data-section-kind=\"" + escapeHtml(item.kind) + "\">" +
      "<p>" + escapeHtml(item.kind) + "</p>" +
      "<h2>" + escapeHtml(item.title) + "</h2>" +
      "<div class=\"aim-viewer-status\">" + escapeHtml(item.statusLabel) + "</div>" +
      "<small>" + escapeHtml(item.sourceReference) + "</small>" +
      "<section>" + fields + "</section>" +
      "</article>";
  }).join("");

  return "<main data-aim-preview-record-viewer=\"true\">" +
    "<header><h1>AIM Preview + Record Viewer</h1><p>Read-only viewer. Records, journal references, and preview state are display-only.</p></header>" +
    "<section class=\"aim-viewer-grid\">" + sections + "</section>" +
    "</main>";
}

export function buildAimPreviewRecordViewerPacket(
  input: AimPreviewRecordViewerInput,
  createdAt = "2026-05-14T21:00:00.000Z"
): AimPreviewRecordViewerPacket {
  const flow = input.flow;
  const record = input.localRecord;
  const shell = input.shellAdapter;
  const decision = flow.decisionItem;
  const journal = flow.journalPacket;
  const staticRender = flow.staticRender;
  const status = deriveAimPreviewRecordViewerStatus(input);

  const sections = [
    section("viewer_status", "Viewer Status", status, shell.shellAdapterId, {
      status,
      shellStatus: shell.status,
      controlledVisibilityOnly: true,
      localOnly: true
    }),
    section("static_preview", "Static Preview", staticRender?.status || "NO_STATIC_RENDER", staticRender?.staticRenderId || "", {
      staticRenderId: staticRender?.staticRenderId || "",
      sourcePreviewHash: staticRender?.sourcePreviewHash || "",
      panelCount: staticRender?.panelCount || 0,
      staticOnly: staticRender?.staticOnly ?? true
    }),
    section("local_record", "Local Record", record.recordStatus, record.recordId, {
      recordId: record.recordId,
      recordStatus: record.recordStatus,
      localOnly: record.localOnly,
      readOnly: record.readOnly
    }),
    section("journal_reference", "Journal Reference", journal?.status || record.journalStatus, journal?.journalPacketId || record.journalPacketId, {
      journalPacketId: journal?.journalPacketId || record.journalPacketId,
      journalStatus: journal?.status || record.journalStatus,
      preservationRequired: journal?.preservationRequired ?? record.preservationRequired,
      mayMutateJournal: false
    }),
    section("decision_snapshot", "Decision Snapshot", decision?.paiSafeStatus || record.paiSafeStatus, decision?.decisionId || record.decisionId, {
      decisionId: decision?.decisionId || record.decisionId,
      assetOrSubject: decision?.assetOrSubject || record.assetOrSubject,
      thesisReference: decision?.thesisReference || record.thesisReference,
      evidenceStrength: decision?.evidenceStrength || record.evidenceStrength
    }),
    section("pai_safe_state", "PAI-SAFE State", decision?.paiSafeStatus || record.paiSafeStatus, decision?.decisionId || record.decisionId, {
      paiSafeStatus: decision?.paiSafeStatus || record.paiSafeStatus,
      humanAuthorityRequired: decision?.paiSafeReviewPacket?.humanAuthorityRequired ?? true,
      journalRequired: decision?.journalRequired ?? true,
      finalAuthority: decision?.finalAuthority || "Human"
    }),
    section("record_path", "Record Path", "LOCAL_RECORD_PATH", record.localRecordPath, {
      localRecordPath: record.localRecordPath,
      boundedToAimRecords: record.localRecordPath.includes("\\aim\\records\\"),
      mayWriteSoul: record.mayWriteSoul
    }),
    section("human_review_boundary", "Human Review Boundary", "HUMAN_REQUIRED", record.recordId, {
      humanReviewRequired: record.humanReviewRequired,
      finalAuthority: record.finalAuthority,
      finalAction: record.finalAction,
      actionBoundary: "View only. No mutation or execution authority."
    })
  ];

  const viewerHash = simpleDeterministicHash({
    flowHash: flow.flowHash,
    shellHash: shell.shellHash,
    recordId: record.recordId,
    decisionId: decision?.decisionId || record.decisionId,
    journalPacketId: journal?.journalPacketId || record.journalPacketId,
    staticRenderId: staticRender?.staticRenderId || ""
  });

  const base = freezeDeep({
    viewerId: "aim_preview_record_viewer_" + stableIdPart(record.recordId),
    createdAt,
    title: "AIM Preview + Record Viewer",
    status,
    sourceFlowId: flow.flowId,
    sourceFlowHash: flow.flowHash,
    sourceShellAdapterId: shell.shellAdapterId,
    sourceRecordId: record.recordId,
    sourceDecisionId: decision?.decisionId || record.decisionId,
    sourceJournalPacketId: journal?.journalPacketId || record.journalPacketId,
    sourceStaticRenderId: staticRender?.staticRenderId || "",
    sourcePreviewHash: staticRender?.sourcePreviewHash || "",
    sections,
    sectionCount: sections.length,
    htmlPreview: "",
    viewerHash,
    readOnly: true,
    deterministic: true,
    controlledVisibilityOnly: true,
    localOnly: true,
    mayMutatePreview: false,
    mayMutateRecord: false,
    mayMutateJournal: false,
    mayMutateAimOutput: false,
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
  }) as Omit<AimPreviewRecordViewerPacket, "htmlPreview">;

  return freezeDeep({
    ...base,
    htmlPreview: renderAimPreviewRecordViewerHtml(base)
  }) as AimPreviewRecordViewerPacket;
}

export function verifyAimPreviewRecordViewerGovernance(
  packet: AimPreviewRecordViewerPacket
): AimPreviewRecordViewerGovernancePacket {
  const checks: Record<string, boolean> = {
    readOnly: packet.readOnly === true,
    deterministic: packet.deterministic === true,
    controlledVisibilityOnly: packet.controlledVisibilityOnly === true,
    localOnly: packet.localOnly === true,
    staticPreviewVisible: packet.sourceStaticRenderId.length > 0 || packet.status === "VIEWER_REFUSED",
    localRecordVisible: packet.sourceRecordId.length > 0,
    journalReferenceVisible: packet.sourceJournalPacketId.length > 0 || packet.status === "VIEWER_REFUSED",
    decisionSnapshotVisible: packet.sourceDecisionId.length > 0 || packet.status === "VIEWER_REFUSED",
    noPreviewMutation: packet.mayMutatePreview === false,
    noRecordMutation: packet.mayMutateRecord === false,
    noJournalMutation: packet.mayMutateJournal === false,
    noAimOutputMutation: packet.mayMutateAimOutput === false,
    noTruthCreation: packet.mayCreateTruth === false,
    noGovernanceAuthority: packet.mayGovern === false,
    noDecisionApproval: packet.mayApproveDecision === false,
    noTradeExecution: packet.mayExecuteTrade === false,
    noFinancialAdvice: packet.mayProvideFinancialAdvice === false,
    noLiveData: packet.mayUseLiveData === false,
    noExternalApi: packet.mayCallExternalApi === false,
    humanAuthorityFinal: packet.finalAuthority === "Human",
    finalActionBlank: packet.finalAction === "",
    htmlRootPresent: packet.htmlPreview.includes("data-aim-preview-record-viewer=\"true\""),
    sectionsReadOnly: packet.sections.every((item) =>
      item.readOnly === true &&
      item.sourceOnly === true &&
      item.mayMutatePreview === false &&
      item.mayMutateRecord === false &&
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
    governanceId: "aim_preview_record_viewer_governance_" + stableIdPart(packet.viewerId),
    createdAt: "2026-05-14T21:05:00.000Z",
    sourceViewerId: packet.viewerId,
    checks,
    status: refusalReasons.length === 0 ? "VIEWER_GOVERNANCE_VERIFIED" : "VIEWER_GOVERNANCE_REFUSED",
    refusalReasons,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimPreviewRecordViewerGovernancePacket;
}