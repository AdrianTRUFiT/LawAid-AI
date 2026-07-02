import {
  AIM_PAI_SAFE_DECISION_STATUS,
  type AimDecisionItem,
  type AimPaiSafeDecisionReviewStatus
} from "./aimDecisionQueueContracts.js";
import type {
  AimJournalPacket,
  AimJournalPacketStatus
} from "./aimJournalContracts.js";
import type {
  AimDecisionFixturePacket,
  AimFixtureExportPacket,
  AimFixtureExportStatus,
  AimFixtureHiddenFieldPolicy,
  AimFixtureManifest,
  AimFixtureRole,
  AimJournalFixturePacket,
  AimQueueSummaryFixture
} from "./aimFixtureContracts.js";

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64) || "fixture";
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

  return "aim_fixture_hash_" + (hash >>> 0).toString(16).padStart(8, "0");
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

function getDecisionAllowedDisplayFields(role: AimFixtureRole): string[] {
  if (role === "audit" || role === "internal_review") {
    return [
      "decisionId",
      "assetOrSubject",
      "signalType",
      "departmentOrigin",
      "agentOrigin",
      "evidenceStrength",
      "riskClass",
      "timingContext",
      "urgencyLevel",
      "paiSafeStatus",
      "prohibitedActionFlag",
      "humanReviewRequired",
      "journalRequired",
      "finalAuthority",
      "nextStep"
    ];
  }

  return [
    "decisionId",
    "assetOrSubject",
    "signalType",
    "evidenceStrength",
    "riskClass",
    "timingContext",
    "urgencyLevel",
    "paiSafeStatus",
    "humanReviewRequired",
    "journalRequired",
    "finalAuthority",
    "nextStep"
  ];
}

function getJournalAllowedDisplayFields(role: AimFixtureRole): string[] {
  if (role === "audit" || role === "internal_review") {
    return [
      "journalPacketId",
      "decisionId",
      "status",
      "resultClassification",
      "reviewOutcome",
      "preservationRequired",
      "humanReviewRequired",
      "finalAuthority"
    ];
  }

  return [
    "journalPacketId",
    "decisionId",
    "status",
    "reviewOutcome",
    "preservationRequired",
    "humanReviewRequired",
    "finalAuthority"
  ];
}

export function deriveAimFixtureHiddenFieldPolicy(role: AimFixtureRole): AimFixtureHiddenFieldPolicy {
  if (role === "audit") return "SHOW_AUDIT_FIELDS";
  if (role === "internal_review") return "SHOW_REVIEW_REASONS";
  return "HIDE_INTERNAL_REASONS";
}

export function deriveAimFixtureExportStatus(
  decisions: AimDecisionItem[],
  journals: AimJournalPacket[]
): AimFixtureExportStatus {
  if (decisions.length === 0 && journals.length === 0) return "FIXTURE_EXPORT_EMPTY";

  const hasReady = decisions.some((decision) => decision.paiSafeStatus === AIM_PAI_SAFE_DECISION_STATUS.SAFE_TO_REVIEW);
  if (hasReady) return "FIXTURE_EXPORT_READY";

  const hasHeld = decisions.some((decision) => decision.paiSafeStatus === AIM_PAI_SAFE_DECISION_STATUS.HOLD_FOR_CONFIRMATION);
  if (hasHeld) return "FIXTURE_EXPORT_HELD";

  return "FIXTURE_EXPORT_ARCHIVED";
}

export function buildAimDecisionFixture(
  decision: AimDecisionItem,
  role: AimFixtureRole = "operator"
): AimDecisionFixturePacket {
  const hiddenInternalFields =
    role === "audit" || role === "internal_review"
      ? []
      : ["sourceInputs", "evidenceSummary", "contradictionFlags", "paiSafeReviewPacket.reasons"];

  return freezeDeep({
    fixtureId: "aim_decision_fixture_" + stableIdPart(decision.decisionId) + "_" + role,
    role,
    decisionId: decision.decisionId,
    assetOrSubject: decision.assetOrSubject,
    signalType: decision.signalType,
    departmentOrigin: decision.departmentOrigin,
    agentOrigin: decision.agentOrigin,
    evidenceStrength: decision.evidenceStrength,
    riskClass: decision.riskClass,
    timingContext: decision.timingContext,
    urgencyLevel: decision.urgencyLevel,
    paiSafeStatus: decision.paiSafeStatus,
    prohibitedActionFlag: decision.prohibitedActionFlag,
    humanReviewRequired: true,
    journalRequired: true,
    finalAuthority: "Human",
    nextStep: decision.nextStep,
    readOnly: true,
    hiddenInternalFields,
    allowedDisplayFields: getDecisionAllowedDisplayFields(role),
    mayMutateSource: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    finalAction: ""
  }) as AimDecisionFixturePacket;
}

export function buildAimJournalFixture(
  journal: AimJournalPacket,
  role: AimFixtureRole = "operator"
): AimJournalFixturePacket {
  const hiddenInternalFields =
    role === "audit" || role === "internal_review"
      ? []
      : ["rationaleSnapshot.readinessReasons", "feedbackLoopInput.nextReviewPrompt", "feedbackLoopInput.contradictionUpdate"];

  return freezeDeep({
    fixtureId: "aim_journal_fixture_" + stableIdPart(journal.journalPacketId) + "_" + role,
    role,
    journalPacketId: journal.journalPacketId,
    decisionId: journal.decisionSnapshot.decisionId,
    status: journal.status,
    resultClassification: journal.feedbackLoopInput.resultClassification,
    reviewOutcome: journal.reviewOutcomePlaceholder.reviewOutcome,
    preservationRequired: true,
    humanReviewRequired: true,
    finalAuthority: "Human",
    readOnly: true,
    hiddenInternalFields,
    allowedDisplayFields: getJournalAllowedDisplayFields(role),
    mayMutateSource: false,
    executionAuthorized: false,
    tradeRecommendation: null,
    financialAdviceProvided: false,
    finalAction: ""
  }) as AimJournalFixturePacket;
}

export function summarizeDecisionStatuses(decisions: AimDecisionItem[]): Record<AimPaiSafeDecisionReviewStatus, number> {
  const summary: Record<AimPaiSafeDecisionReviewStatus, number> = {
    [AIM_PAI_SAFE_DECISION_STATUS.SAFE_TO_REVIEW]: 0,
    [AIM_PAI_SAFE_DECISION_STATUS.HOLD_FOR_CONFIRMATION]: 0,
    [AIM_PAI_SAFE_DECISION_STATUS.REFUSED_INSUFFICIENT_SIGNAL]: 0,
    [AIM_PAI_SAFE_DECISION_STATUS.REFUSED_THESIS_CONTRADICTION]: 0,
    [AIM_PAI_SAFE_DECISION_STATUS.REFUSED_RISK_TOO_HIGH]: 0,
    [AIM_PAI_SAFE_DECISION_STATUS.REFUSED_UNDOCUMENTED_ACTION]: 0
  };

  for (const decision of decisions) {
    summary[decision.paiSafeStatus] += 1;
  }

  return summary;
}

export function summarizeJournalStatuses(journals: AimJournalPacket[]): Record<AimJournalPacketStatus, number> {
  const summary: Record<AimJournalPacketStatus, number> = {
    JOURNAL_READY: 0,
    JOURNAL_HELD: 0,
    JOURNAL_REFUSED_INPUT: 0,
    JOURNAL_ARCHIVED_FOR_REVIEW: 0
  };

  for (const journal of journals) {
    summary[journal.status] += 1;
  }

  return summary;
}

export function buildAimQueueSummaryFixture(
  decisions: AimDecisionItem[],
  journals: AimJournalPacket[],
  role: AimFixtureRole = "operator"
): AimQueueSummaryFixture {
  return freezeDeep({
    fixtureId: "aim_queue_summary_fixture_" + role,
    role,
    totalDecisions: decisions.length,
    totalJournals: journals.length,
    decisionStatusCounts: summarizeDecisionStatuses(decisions),
    journalStatusCounts: summarizeJournalStatuses(journals),
    readOnly: true,
    mayMutateSource: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    finalAction: ""
  }) as AimQueueSummaryFixture;
}

export function buildAimFixtureManifest(
  decisions: AimDecisionItem[],
  journals: AimJournalPacket[],
  role: AimFixtureRole,
  createdAt: string
): AimFixtureManifest {
  return freezeDeep({
    manifestId: "aim_fixture_manifest_" + stableIdPart(createdAt) + "_" + role,
    createdAt,
    source: "AIM",
    pass: "AIM_PASS_5_READ_ONLY_FIXTURE_EXPORT",
    readOnly: true,
    deterministic: true,
    fixtureCount: decisions.length + journals.length + 1,
    decisionCount: decisions.length,
    journalCount: journals.length,
    exportStatus: deriveAimFixtureExportStatus(decisions, journals),
    hiddenFieldPolicy: deriveAimFixtureHiddenFieldPolicy(role),
    mayRenderUi: false,
    mayMutateState: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAction: ""
  }) as AimFixtureManifest;
}

export function buildAimFixtureExportPacket(
  decisions: AimDecisionItem[],
  journals: AimJournalPacket[],
  role: AimFixtureRole = "operator",
  createdAt = "2026-05-14T13:00:00.000Z"
): AimFixtureExportPacket {
  const decisionFixtures = decisions.map((decision) => buildAimDecisionFixture(decision, role));
  const journalFixtures = journals.map((journal) => buildAimJournalFixture(journal, role));
  const queueSummaryFixture = buildAimQueueSummaryFixture(decisions, journals, role);
  const manifest = buildAimFixtureManifest(decisions, journals, role, createdAt);

  const hashSource = {
    manifest,
    decisionFixtures,
    journalFixtures,
    queueSummaryFixture
  };

  return freezeDeep({
    manifest,
    decisionFixtures,
    journalFixtures,
    queueSummaryFixture,
    readOnly: true,
    deterministic: true,
    exportHash: simpleDeterministicHash(hashSource),
    preservationRequired: true,
    humanReviewRequired: true,
    finalAuthority: "Human",
    mayRenderUi: false,
    mayMutateState: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAction: ""
  }) as AimFixtureExportPacket;
}