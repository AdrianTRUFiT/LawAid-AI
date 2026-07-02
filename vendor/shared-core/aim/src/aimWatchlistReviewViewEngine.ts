import type {
  AimWatchlistReviewGovernancePacket,
  AimWatchlistReviewSection,
  AimWatchlistReviewSectionKind,
  AimWatchlistReviewViewInput,
  AimWatchlistReviewViewPacket,
  AimWatchlistReviewViewStatus
} from "./aimWatchlistReviewViewContracts.js";

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 72) || "watchlist_review";
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
  return "aim_review_hash_" + (hash >>> 0).toString(16).padStart(8, "0");
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
  kind: AimWatchlistReviewSectionKind,
  title: string,
  statusLabel: string,
  sourceReference: string,
  displayFields: Record<string, string | number | boolean | null>
): AimWatchlistReviewSection {
  return freezeDeep({
    sectionId: "aim_watchlist_review_section_" + stableIdPart(kind + "_" + title),
    kind,
    title,
    statusLabel,
    displayFields,
    sourceReference,
    readOnly: true,
    sourceOnly: true,
    mayMutateWatchlist: false,
    mayMutateReview: false,
    mayMutateRecord: false,
    mayMutateJournal: false,
    mayCreateTruth: false,
    mayApproveDecision: false,
    mayExecuteTrade: false,
    mayProvideFinancialAdvice: false,
    mayUseLiveData: false,
    finalAction: ""
  }) as AimWatchlistReviewSection;
}

export function deriveAimWatchlistReviewViewStatus(input: AimWatchlistReviewViewInput): AimWatchlistReviewViewStatus {
  if (input.localRecord.recordStatus === "LOCAL_RECORD_REFUSED") return "WATCHLIST_REVIEW_REFUSED";
  if (input.watchlistItem.status === "WATCHLIST_HELD" || input.watchlistItem.status === "WATCHLIST_NEEDS_REVIEW") return "WATCHLIST_REVIEW_HELD";
  return "WATCHLIST_REVIEW_READY";
}

export function renderAimWatchlistReviewViewHtml(packet: Omit<AimWatchlistReviewViewPacket, "htmlPreview">): string {
  const sections = packet.sections.map((item) => {
    const fields = Object.entries(item.displayFields).map(([key, value]) => {
      return "<div class=\"aim-review-field\"><span>" + escapeHtml(key) + "</span><strong>" + escapeHtml(value) + "</strong></div>";
    }).join("");

    return "<article class=\"aim-review-card\" data-section-kind=\"" + escapeHtml(item.kind) + "\">" +
      "<p>" + escapeHtml(item.kind) + "</p>" +
      "<h2>" + escapeHtml(item.title) + "</h2>" +
      "<div class=\"aim-review-status\">" + escapeHtml(item.statusLabel) + "</div>" +
      "<small>" + escapeHtml(item.sourceReference) + "</small>" +
      "<section>" + fields + "</section>" +
      "</article>";
  }).join("");

  return "<main data-aim-watchlist-review-view=\"true\">" +
    "<header><h1>AIM Watchlist + Human Review View</h1><p>Read-only review surface. Human review is preserved, not automated.</p></header>" +
    "<section class=\"aim-review-grid\">" + sections + "</section>" +
    "</main>";
}

export function buildAimWatchlistReviewViewPacket(
  input: AimWatchlistReviewViewInput,
  createdAt = "2026-05-14T22:00:00.000Z"
): AimWatchlistReviewViewPacket {
  const watchlist = input.watchlistItem;
  const record = input.localRecord;
  const review = input.reviewOutcome;
  const viewer = input.viewerPacket;
  const status = deriveAimWatchlistReviewViewStatus(input);

  const sections = [
    section("watchlist_status", "Watchlist Status", watchlist.status, watchlist.watchlistId, {
      watchlistId: watchlist.watchlistId,
      status: watchlist.status,
      latestPaiSafeStatus: watchlist.latestPaiSafeStatus,
      latestJournalStatus: watchlist.latestJournalStatus
    }),
    section("thesis_continuity", "Thesis Continuity", watchlist.thesisReference, watchlist.latestRecordId, {
      assetOrSubject: watchlist.assetOrSubject,
      thesisReference: watchlist.thesisReference,
      thesisNote: watchlist.thesisNote,
      recordCount: watchlist.recordCount,
      reviewCount: watchlist.reviewCount
    }),
    section("latest_record", "Latest Local Record", record.recordStatus, record.recordId, {
      recordId: record.recordId,
      decisionId: record.decisionId,
      journalPacketId: record.journalPacketId,
      evidenceStrength: record.evidenceStrength,
      riskClass: record.riskClass
    }),
    section("human_review_outcome", "Human Review Outcome", review.reviewDecision, review.reviewId, {
      reviewId: review.reviewId,
      reviewer: review.reviewer,
      reviewDecision: review.reviewDecision,
      resultClassification: review.resultClassification,
      humanDecisionNote: review.humanDecisionNote
    }),
    section("lesson_learned", "Lesson Learned", review.resultClassification, review.reviewId, {
      lessonLearned: review.lessonLearned,
      decisionImprovementNote: review.decisionImprovementNote
    }),
    section("decision_improvement", "Decision Improvement", "REVIEW_IMPROVEMENT_ONLY", review.reviewId, {
      decisionImprovementNote: review.decisionImprovementNote,
      nextReviewPrompt: review.nextReviewPrompt,
      mayApproveDecision: false
    }),
    section("contradiction_update", "Contradiction Update", review.contradictionUpdate ? "CONTRADICTION_UPDATED" : "NO_CONTRADICTION_UPDATE", review.reviewId, {
      contradictionUpdate: review.contradictionUpdate,
      watchlistContradictionNote: watchlist.contradictionNote
    }),
    section("next_review_prompt", "Next Review Prompt", "HUMAN_REVIEW_REQUIRED", review.reviewId, {
      nextReviewPrompt: review.nextReviewPrompt,
      viewerReference: viewer?.viewerId || "",
      sourceViewerStatus: viewer?.status || ""
    }),
    section("authority_boundary", "Authority Boundary", "NO_EXECUTION_AUTHORITY", review.reviewId, {
      humanReviewRequired: true,
      finalAuthority: "Human",
      finalAction: "",
      actionBoundary: "View and record review only. No approval, advice, or execution authority."
    })
  ];

  const viewHash = simpleDeterministicHash({
    watchlistId: watchlist.watchlistId,
    recordId: record.recordId,
    reviewId: review.reviewId,
    viewerId: viewer?.viewerId || "",
    sections: sections.map((item) => ({
      kind: item.kind,
      statusLabel: item.statusLabel,
      displayFields: item.displayFields
    }))
  });

  const base = freezeDeep({
    viewId: "aim_watchlist_review_view_" + stableIdPart(watchlist.watchlistId + "_" + review.reviewId),
    createdAt,
    title: "AIM Watchlist + Human Review View",
    status,
    sourceWatchlistId: watchlist.watchlistId,
    sourceRecordId: record.recordId,
    sourceReviewId: review.reviewId,
    sourceDecisionId: record.decisionId,
    sourceViewerId: viewer?.viewerId || "",
    sections,
    sectionCount: sections.length,
    htmlPreview: "",
    viewHash,
    readOnly: true,
    deterministic: true,
    controlledVisibilityOnly: true,
    localOnly: true,
    mayMutateWatchlist: false,
    mayMutateReview: false,
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
  }) as Omit<AimWatchlistReviewViewPacket, "htmlPreview">;

  return freezeDeep({
    ...base,
    htmlPreview: renderAimWatchlistReviewViewHtml(base)
  }) as AimWatchlistReviewViewPacket;
}

export function verifyAimWatchlistReviewGovernance(
  packet: AimWatchlistReviewViewPacket
): AimWatchlistReviewGovernancePacket {
  const checks: Record<string, boolean> = {
    readOnly: packet.readOnly === true,
    deterministic: packet.deterministic === true,
    controlledVisibilityOnly: packet.controlledVisibilityOnly === true,
    localOnly: packet.localOnly === true,
    watchlistVisible: packet.sourceWatchlistId.length > 0,
    recordVisible: packet.sourceRecordId.length > 0,
    reviewVisible: packet.sourceReviewId.length > 0,
    decisionVisible: packet.sourceDecisionId.length > 0 || packet.status === "WATCHLIST_REVIEW_REFUSED",
    noWatchlistMutation: packet.mayMutateWatchlist === false,
    noReviewMutation: packet.mayMutateReview === false,
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
    htmlRootPresent: packet.htmlPreview.includes("data-aim-watchlist-review-view=\"true\""),
    sectionsReadOnly: packet.sections.every((item) =>
      item.readOnly === true &&
      item.sourceOnly === true &&
      item.mayMutateWatchlist === false &&
      item.mayMutateReview === false &&
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
    governanceId: "aim_watchlist_review_governance_" + stableIdPart(packet.viewId),
    createdAt: "2026-05-14T22:05:00.000Z",
    sourceViewId: packet.viewId,
    checks,
    status: refusalReasons.length === 0 ? "WATCHLIST_REVIEW_GOVERNANCE_VERIFIED" : "WATCHLIST_REVIEW_GOVERNANCE_REFUSED",
    refusalReasons,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimWatchlistReviewGovernancePacket;
}