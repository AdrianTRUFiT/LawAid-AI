import type { AimOperatorEndToEndFlowPacket } from "./aimOperatorWorkflowContracts.js";
import type {
  AimFeedbackSummaryPacket,
  AimFeedbackTrend,
  AimHumanReviewDecision,
  AimHumanReviewOutcomePacket,
  AimLocalRecordPacket,
  AimLocalRecordStatus,
  AimWatchlistStatus,
  AimWatchlistThesisItem
} from "./aimMemoryReviewContracts.js";
import type { AimDecisionResultClassification } from "./aimJournalContracts.js";

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 72) || "memory";
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
  return "aim_memory_hash_" + (hash >>> 0).toString(16).padStart(8, "0");
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

export function deriveAimLocalRecordStatus(flow: AimOperatorEndToEndFlowPacket): AimLocalRecordStatus {
  if (flow.status === "FLOW_REFUSED_INPUT" || !flow.decisionItem || !flow.journalPacket) return "LOCAL_RECORD_REFUSED";
  if (flow.decisionItem.paiSafeStatus === "SAFE TO REVIEW") return "LOCAL_RECORD_READY";
  if (flow.decisionItem.paiSafeStatus === "HOLD FOR CONFIRMATION") return "LOCAL_RECORD_HELD";
  return "LOCAL_RECORD_ARCHIVED";
}

export function buildAimLocalRecordPacket(
  flow: AimOperatorEndToEndFlowPacket,
  createdAt = "2026-05-14T17:00:00.000Z"
): AimLocalRecordPacket {
  if (!flow.decisionItem || !flow.journalPacket) {
    return freezeDeep({
      recordId: "aim_local_record_refused_" + stableIdPart(flow.sourceDraftId),
      createdAt,
      sourceFlowId: flow.flowId,
      sourceDraftId: flow.sourceDraftId,
      decisionId: "",
      journalPacketId: "",
      flowHash: flow.flowHash,
      paiSafeStatus: "REFUSED — UNDOCUMENTED ACTION",
      journalStatus: "JOURNAL_REFUSED_INPUT",
      recordStatus: "LOCAL_RECORD_REFUSED",
      assetOrSubject: "",
      thesisReference: "",
      evidenceStrength: "",
      riskClass: "",
      timingContext: "",
      localRecordPath: "D:\\DEV\\AIVA\\shared-core\\aim\\records\\refused\\" + stableIdPart(flow.sourceDraftId) + ".json",
      readOnly: true,
      deterministic: true,
      localOnly: true,
      preservationRequired: true,
      humanReviewRequired: true,
      mayWriteSoul: false,
      mayExecuteTrade: false,
      mayApproveInvestment: false,
      mayProvideFinancialAdvice: false,
      mayMutateSource: false,
      finalAuthority: "Human",
      finalAction: ""
    }) as AimLocalRecordPacket;
  }

  const recordStatus = deriveAimLocalRecordStatus(flow);
  const recordId = "aim_local_record_" + stableIdPart(flow.decisionItem.decisionId) + "_" + simpleDeterministicHash(flow.flowHash);

  return freezeDeep({
    recordId,
    createdAt,
    sourceFlowId: flow.flowId,
    sourceDraftId: flow.sourceDraftId,
    decisionId: flow.decisionItem.decisionId,
    journalPacketId: flow.journalPacket.journalPacketId,
    flowHash: flow.flowHash,
    paiSafeStatus: flow.decisionItem.paiSafeStatus,
    journalStatus: flow.journalPacket.status,
    recordStatus,
    assetOrSubject: flow.decisionItem.assetOrSubject,
    thesisReference: flow.decisionItem.thesisReference,
    evidenceStrength: flow.decisionItem.evidenceStrength,
    riskClass: flow.decisionItem.riskClass,
    timingContext: flow.decisionItem.timingContext,
    localRecordPath: "D:\\DEV\\AIVA\\shared-core\\aim\\records\\" + stableIdPart(recordStatus) + "\\" + stableIdPart(recordId) + ".json",
    readOnly: true,
    deterministic: true,
    localOnly: true,
    preservationRequired: true,
    humanReviewRequired: true,
    mayWriteSoul: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayMutateSource: false,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimLocalRecordPacket;
}

export function deriveAimWatchlistStatus(record: AimLocalRecordPacket): AimWatchlistStatus {
  if (record.recordStatus === "LOCAL_RECORD_READY") return "WATCHLIST_ACTIVE";
  if (record.recordStatus === "LOCAL_RECORD_HELD") return "WATCHLIST_HELD";
  if (record.recordStatus === "LOCAL_RECORD_ARCHIVED") return "WATCHLIST_ARCHIVED";
  return "WATCHLIST_NEEDS_REVIEW";
}

export function buildAimWatchlistThesisItem(
  record: AimLocalRecordPacket,
  reviewCount = 0,
  createdAt = "2026-05-14T17:10:00.000Z",
  thesisNote = "Track thesis quality through human review before any action.",
  contradictionNote = ""
): AimWatchlistThesisItem {
  return freezeDeep({
    watchlistId: "aim_watchlist_" + stableIdPart(record.assetOrSubject || record.sourceDraftId),
    createdAt,
    assetOrSubject: record.assetOrSubject,
    thesisReference: record.thesisReference,
    latestRecordId: record.recordId,
    latestPaiSafeStatus: record.paiSafeStatus,
    latestJournalStatus: record.journalStatus,
    evidenceStrength: record.evidenceStrength,
    riskClass: record.riskClass,
    timingContext: record.timingContext,
    reviewCount,
    recordCount: 1,
    status: deriveAimWatchlistStatus(record),
    lastReviewedAt: "",
    thesisNote,
    contradictionNote,
    readOnly: true,
    localOnly: true,
    humanReviewRequired: true,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimWatchlistThesisItem;
}

export function buildAimHumanReviewOutcomePacket(
  record: AimLocalRecordPacket,
  reviewDecision: AimHumanReviewDecision,
  resultClassification: AimDecisionResultClassification,
  humanDecisionNote: string,
  lessonLearned: string,
  decisionImprovementNote: string,
  contradictionUpdate = "",
  createdAt = "2026-05-14T17:20:00.000Z"
): AimHumanReviewOutcomePacket {
  return freezeDeep({
    reviewId: "aim_human_review_" + stableIdPart(record.recordId) + "_" + stableIdPart(resultClassification),
    createdAt,
    reviewer: "Human",
    sourceRecordId: record.recordId,
    sourceDecisionId: record.decisionId,
    reviewDecision,
    resultClassification,
    humanDecisionNote,
    lessonLearned,
    decisionImprovementNote,
    contradictionUpdate,
    nextReviewPrompt: "Compare the next signal against this review outcome before increasing confidence.",
    readOnly: true,
    localOnly: true,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimHumanReviewOutcomePacket;
}

function deriveFeedbackTrend(reviews: AimHumanReviewOutcomePacket[]): AimFeedbackTrend {
  if (reviews.length < 2) return "INSUFFICIENT_HISTORY";
  const strengthened = reviews.filter((r) => r.resultClassification === "THESIS_STRENGTHENED").length;
  const weakened = reviews.filter((r) => r.resultClassification === "THESIS_WEAKENED").length;
  const riskIncreasing = reviews.filter((r) => r.resultClassification === "RISK_INCREASED").length;
  const riskReducing = reviews.filter((r) => r.resultClassification === "RISK_REDUCED").length;

  if (riskIncreasing > riskReducing) return "RISK_INCREASING";
  if (riskReducing > riskIncreasing) return "RISK_REDUCING";
  if (strengthened > weakened) return "THESIS_STRENGTHENING";
  if (weakened > strengthened) return "THESIS_WEAKENING";
  return "IMPROVING_SIGNAL_DISCIPLINE";
}

export function buildAimFeedbackSummaryPacket(
  records: AimLocalRecordPacket[],
  watchlist: AimWatchlistThesisItem[],
  reviews: AimHumanReviewOutcomePacket[],
  createdAt = "2026-05-14T17:30:00.000Z"
): AimFeedbackSummaryPacket {
  const counts: Record<AimDecisionResultClassification, number> = {
    PENDING_RESULT: 0,
    THESIS_STRENGTHENED: 0,
    THESIS_WEAKENED: 0,
    CONTRADICTION_CONFIRMED: 0,
    RISK_REDUCED: 0,
    RISK_INCREASED: 0,
    NO_ACTION_TAKEN: 0,
    INSUFFICIENT_DATA: 0
  };

  for (const review of reviews) {
    counts[review.resultClassification] += 1;
  }

  return freezeDeep({
    summaryId: "aim_feedback_summary_" + simpleDeterministicHash({ records: records.map((r) => r.recordId), reviews: reviews.map((r) => r.reviewId) }),
    createdAt,
    recordCount: records.length,
    reviewCount: reviews.length,
    watchlistCount: watchlist.length,
    trend: deriveFeedbackTrend(reviews),
    resultClassificationCounts: counts,
    latestLessons: reviews.map((review) => review.lessonLearned).filter((value) => value.length > 0).slice(-5),
    improvementPrompts: reviews.map((review) => review.decisionImprovementNote).filter((value) => value.length > 0).slice(-5),
    contradictionUpdates: reviews.map((review) => review.contradictionUpdate).filter((value) => value.length > 0).slice(-5),
    readOnly: true,
    deterministic: true,
    localOnly: true,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimFeedbackSummaryPacket;
}