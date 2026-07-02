import type {
  AimLocalOperatorViewPacket,
  AimShellAdapterInput,
  AimShellAdapterPacket,
  AimShellConnectionStatus,
  AimShellDisplaySection,
  AimShellSectionKind
} from "./aimShellAdapterContracts.js";

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 72) || "shell";
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
  return "aim_shell_hash_" + (hash >>> 0).toString(16).padStart(8, "0");
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
  kind: AimShellSectionKind,
  title: string,
  statusLabel: string,
  displayFields: Record<string, string | number | boolean | null>
): AimShellDisplaySection {
  return freezeDeep({
    sectionId: "aim_shell_section_" + stableIdPart(kind + "_" + title),
    kind,
    title,
    statusLabel,
    displayFields,
    readOnly: true,
    sourceOnly: true,
    mayMutateSource: false,
    mayMutateJournal: false,
    mayExecuteTrade: false,
    mayApproveDecision: false,
    mayProvideFinancialAdvice: false,
    mayUseLiveData: false,
    finalAction: ""
  }) as AimShellDisplaySection;
}

export function deriveAimShellConnectionStatus(input: AimShellAdapterInput): AimShellConnectionStatus {
  if (input.flow.status === "FLOW_REFUSED_INPUT") return "AIM_SHELL_REFUSED";
  if (!input.flow.decisionItem || !input.flow.journalPacket) return "AIM_SHELL_HELD";
  return "AIM_SHELL_CONNECTED";
}

export function buildAimShellAdapterPacket(
  input: AimShellAdapterInput,
  createdAt = "2026-05-14T19:00:00.000Z"
): AimShellAdapterPacket {
  const flow = input.flow;
  const decision = flow.decisionItem;
  const journal = flow.journalPacket;
  const status = deriveAimShellConnectionStatus(input);

  const sections: AimShellDisplaySection[] = [
    section("aim_status", "AIM Status", status, {
      product: "AIM — AI MarketIntel",
      version: "v0.2-shell-sprint1",
      flowStatus: flow.status,
      localOnly: flow.localOnly,
      readOnly: flow.readOnly,
      controlledVisibilityOnly: true
    }),
    section("decision_queue", "Decision Queue", decision?.paiSafeStatus || "NO_DECISION_ITEM", {
      decisionId: decision?.decisionId || "",
      assetOrSubject: decision?.assetOrSubject || "",
      signalType: decision?.signalType || "",
      departmentOrigin: decision?.departmentOrigin || "",
      agentOrigin: decision?.agentOrigin || "",
      queueVisible: Boolean(decision?.decisionId)
    }),
    section("pai_safe_review", "PAI-SAFE Review State", decision?.paiSafeStatus || "NOT_AVAILABLE", {
      paiSafeStatus: decision?.paiSafeStatus || "",
      humanAuthorityRequired: decision?.paiSafeReviewPacket?.humanAuthorityRequired ?? true,
      journalRequired: decision?.journalRequired ?? true,
      finalAuthority: decision?.finalAuthority || "Human"
    }),
    section("refusal_hold_reasons", "Refusal / Hold Reasons", decision?.paiSafeStatus || "NOT_AVAILABLE", {
      paiSafeStatus: decision?.paiSafeStatus || "",
      contradictionFlagCount: decision?.contradictionFlags.length || 0,
      prohibitedActionFlag: decision?.prohibitedActionFlag || false,
      nextStep: decision?.nextStep || flow.intakeScreen.validation.issues.join(", ")
    }),
    section("evidence_summary", "Evidence Summary", decision?.evidenceStrength || "NOT_AVAILABLE", {
      evidenceSummary: decision?.evidenceSummary || "",
      evidenceStrength: decision?.evidenceStrength || "",
      sourceInputCount: decision?.sourceInputs.length || 0,
      documentationRequired: true
    }),
    section("risk_contradiction_flags", "Risk / Contradiction Flags", decision?.riskClass || "NOT_AVAILABLE", {
      riskClass: decision?.riskClass || "",
      timingContext: decision?.timingContext || "",
      urgencyLevel: decision?.urgencyLevel || "",
      contradictionFlags: decision?.contradictionFlags.join(" | ") || ""
    }),
    section("human_review", "Human Review Required", "HUMAN_REVIEW_REQUIRED", {
      humanReviewRequired: flow.humanReviewRequired,
      finalAuthority: flow.finalAuthority,
      finalAction: flow.finalAction,
      mayApproveDecision: false
    }),
    section("journal_reference", "Journal Reference", journal?.status || "NO_JOURNAL_PACKET", {
      journalPacketId: journal?.journalPacketId || "",
      journalStatus: journal?.status || "",
      preservationRequired: journal?.preservationRequired ?? true,
      localRecordId: input.localRecord?.recordId || ""
    }),
    section("next_operator_action", "Next Operator Action", "REVIEW_ONLY", {
      nextStep: decision?.nextStep || "Resolve intake refusal before continuing.",
      watchlistStatus: input.watchlistItem?.status || "",
      feedbackTrend: input.feedbackSummary?.trend || "",
      actionBoundary: "Review only. No execution authority."
    })
  ];

  const shellHash = simpleDeterministicHash({
    sourceFlowId: flow.flowId,
    sourceFlowHash: flow.flowHash,
    decisionId: decision?.decisionId || "",
    journalPacketId: journal?.journalPacketId || "",
    sections: sections.map((item) => ({
      kind: item.kind,
      statusLabel: item.statusLabel,
      displayFields: item.displayFields
    }))
  });

  return freezeDeep({
    shellAdapterId: "aim_shell_adapter_" + stableIdPart(flow.flowId),
    createdAt,
    sourceFlowId: flow.flowId,
    sourceFlowHash: flow.flowHash,
    sourceDecisionId: decision?.decisionId || "",
    sourceJournalPacketId: journal?.journalPacketId || "",
    status,
    product: "AIM — AI MarketIntel",
    version: "v0.2-shell-sprint1",
    sections,
    sectionCount: sections.length,
    shellHash,
    readOnly: true,
    deterministic: true,
    controlledVisibilityOnly: true,
    localOnly: true,
    preservesOriginalValues: true,
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
  }) as AimShellAdapterPacket;
}

export function renderAimLocalOperatorViewHtml(adapter: AimShellAdapterPacket): string {
  const sections = adapter.sections.map((item) => {
    const fields = Object.entries(item.displayFields).map(([key, value]) => {
      return "<div class=\"aim-shell-field\"><span>" + escapeHtml(key) + "</span><strong>" + escapeHtml(value) + "</strong></div>";
    }).join("");

    return "<article class=\"aim-shell-card\" data-section-kind=\"" + escapeHtml(item.kind) + "\">" +
      "<p>" + escapeHtml(item.kind) + "</p>" +
      "<h2>" + escapeHtml(item.title) + "</h2>" +
      "<div class=\"aim-shell-status\">" + escapeHtml(item.statusLabel) + "</div>" +
      "<section>" + fields + "</section>" +
      "</article>";
  }).join("");

  return "<main data-aim-shell-view=\"true\">" +
    "<header><h1>AIM — AI MarketIntel</h1><p>Controlled visibility only. Human review remains required.</p></header>" +
    "<section class=\"aim-shell-grid\">" + sections + "</section>" +
    "</main>";
}

export function buildAimLocalOperatorViewPacket(
  adapter: AimShellAdapterPacket,
  createdAt = "2026-05-14T19:05:00.000Z"
): AimLocalOperatorViewPacket {
  return freezeDeep({
    viewId: "aim_local_operator_view_" + stableIdPart(adapter.shellAdapterId),
    createdAt,
    sourceShellAdapterId: adapter.shellAdapterId,
    title: "AIM — AI MarketIntel",
    subtitle: "Bounded local operator view for verified AIM v0.1 outputs.",
    shellStatus: adapter.status,
    visibleSections: adapter.sections,
    htmlPreview: renderAimLocalOperatorViewHtml(adapter),
    readOnly: true,
    deterministic: true,
    minimalView: true,
    mayRedesignDashboard: false,
    mayMutateAimOutput: false,
    mayMutateJournal: false,
    mayExecuteTrade: false,
    mayApproveDecision: false,
    mayProvideFinancialAdvice: false,
    mayUseLiveData: false,
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimLocalOperatorViewPacket;
}

export function verifyAimShellReadOnlyGovernance(adapter: AimShellAdapterPacket, view: AimLocalOperatorViewPacket): Record<string, boolean> {
  return {
    adapterReadOnly: adapter.readOnly === true,
    viewReadOnly: view.readOnly === true,
    controlledVisibilityOnly: adapter.controlledVisibilityOnly === true,
    preservesOriginalValues: adapter.preservesOriginalValues === true,
    noAimMutation: adapter.mayMutateAimOutput === false && view.mayMutateAimOutput === false,
    noJournalMutation: adapter.mayMutateJournal === false && view.mayMutateJournal === false,
    noTruthCreation: adapter.mayCreateTruth === false,
    noGovernanceAuthority: adapter.mayGovern === false,
    noDecisionApproval: adapter.mayApproveDecision === false && view.mayApproveDecision === false,
    noTradeExecution: adapter.mayExecuteTrade === false && view.mayExecuteTrade === false,
    noFinancialAdvice: adapter.mayProvideFinancialAdvice === false && view.mayProvideFinancialAdvice === false,
    noLiveData: adapter.mayUseLiveData === false && view.mayUseLiveData === false,
    noExternalApi: adapter.mayCallExternalApi === false,
    humanAuthorityFinal: adapter.finalAuthority === "Human" && view.finalAuthority === "Human",
    finalActionBlank: adapter.finalAction === "" && view.finalAction === "",
    sectionsReadOnly: adapter.sections.every((item) =>
      item.readOnly === true &&
      item.mayMutateSource === false &&
      item.mayMutateJournal === false &&
      item.mayExecuteTrade === false &&
      item.mayApproveDecision === false &&
      item.mayProvideFinancialAdvice === false &&
      item.mayUseLiveData === false &&
      item.finalAction === ""
    )
  };
}