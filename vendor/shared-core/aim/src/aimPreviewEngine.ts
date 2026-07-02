import {
  type AimDecisionFixturePacket,
  type AimFixtureExportPacket,
  type AimFixtureRole,
  type AimJournalFixturePacket
} from "./aimFixtureContracts.js";
import type {
  AimPreviewHarnessErrorInput,
  AimPreviewHarnessPacket,
  AimPreviewHarnessStatus,
  AimPreviewPanelPacket,
  AimPreviewSeverity
} from "./aimPreviewContracts.js";

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64) || "preview";
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

  return "aim_preview_hash_" + (hash >>> 0).toString(16).padStart(8, "0");
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

export function mapFixtureExportStatusToPreviewStatus(exportPacket: AimFixtureExportPacket): AimPreviewHarnessStatus {
  if (exportPacket.manifest.exportStatus === "FIXTURE_EXPORT_READY") return "PREVIEW_READY";
  if (exportPacket.manifest.exportStatus === "FIXTURE_EXPORT_HELD") return "PREVIEW_HELD";
  if (exportPacket.manifest.exportStatus === "FIXTURE_EXPORT_ARCHIVED") return "PREVIEW_ARCHIVED";
  if (exportPacket.manifest.exportStatus === "FIXTURE_EXPORT_EMPTY") return "PREVIEW_EMPTY";
  return "PREVIEW_ERROR";
}

export function mapDecisionStatusToPreviewSeverity(status: string): AimPreviewSeverity {
  if (status === "SAFE TO REVIEW") return "success";
  if (status === "HOLD FOR CONFIRMATION") return "warning";
  if (status.startsWith("REFUSED")) return "refused";
  return "neutral";
}

export function mapJournalStatusToPreviewSeverity(status: string): AimPreviewSeverity {
  if (status === "JOURNAL_READY") return "success";
  if (status === "JOURNAL_HELD") return "warning";
  if (status === "JOURNAL_ARCHIVED_FOR_REVIEW") return "refused";
  return "neutral";
}

export function buildManifestSummaryPanel(
  exportPacket: AimFixtureExportPacket,
  role: AimFixtureRole
): AimPreviewPanelPacket {
  return freezeDeep({
    panelId: "aim_preview_manifest_" + stableIdPart(exportPacket.manifest.manifestId),
    kind: "manifest_summary",
    role,
    title: "AIM Fixture Export Summary",
    statusLabel: exportPacket.manifest.exportStatus,
    severity: exportPacket.manifest.exportStatus === "FIXTURE_EXPORT_READY" ? "success" : exportPacket.manifest.exportStatus === "FIXTURE_EXPORT_EMPTY" ? "neutral" : "warning",
    summary: "Read-only fixture export summary prepared for preview harness consumption.",
    displayFields: {
      exportStatus: exportPacket.manifest.exportStatus,
      decisionCount: exportPacket.manifest.decisionCount,
      journalCount: exportPacket.manifest.journalCount,
      fixtureCount: exportPacket.manifest.fixtureCount,
      hiddenFieldPolicy: exportPacket.manifest.hiddenFieldPolicy,
      sourceExportHash: exportPacket.exportHash
    },
    hiddenFields: [],
    sourceFixtureId: exportPacket.manifest.manifestId,
    readOnly: true,
    mayRenderReactUi: false,
    mayMutateSource: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAction: ""
  }) as AimPreviewPanelPacket;
}

export function buildDecisionPreviewPanel(
  fixture: AimDecisionFixturePacket
): AimPreviewPanelPacket {
  return freezeDeep({
    panelId: "aim_preview_decision_" + stableIdPart(fixture.fixtureId),
    kind: "decision_panel",
    role: fixture.role,
    title: "Decision Preview",
    statusLabel: fixture.paiSafeStatus,
    severity: mapDecisionStatusToPreviewSeverity(fixture.paiSafeStatus),
    summary: "Read-only decision fixture preview. Human review remains required.",
    displayFields: {
      decisionId: fixture.decisionId,
      assetOrSubject: fixture.assetOrSubject,
      signalType: fixture.signalType,
      evidenceStrength: fixture.evidenceStrength,
      riskClass: fixture.riskClass,
      timingContext: fixture.timingContext,
      urgencyLevel: fixture.urgencyLevel,
      paiSafeStatus: fixture.paiSafeStatus,
      prohibitedActionFlag: fixture.prohibitedActionFlag,
      finalAuthority: fixture.finalAuthority
    },
    hiddenFields: [...fixture.hiddenInternalFields],
    sourceFixtureId: fixture.fixtureId,
    readOnly: true,
    mayRenderReactUi: false,
    mayMutateSource: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAction: ""
  }) as AimPreviewPanelPacket;
}

export function buildJournalPreviewPanel(
  fixture: AimJournalFixturePacket
): AimPreviewPanelPacket {
  return freezeDeep({
    panelId: "aim_preview_journal_" + stableIdPart(fixture.fixtureId),
    kind: "journal_panel",
    role: fixture.role,
    title: "Journal Preview",
    statusLabel: fixture.status,
    severity: mapJournalStatusToPreviewSeverity(fixture.status),
    summary: "Read-only journal fixture preview. Preservation remains required.",
    displayFields: {
      journalPacketId: fixture.journalPacketId,
      decisionId: fixture.decisionId,
      status: fixture.status,
      resultClassification: fixture.resultClassification,
      reviewOutcome: fixture.reviewOutcome,
      preservationRequired: fixture.preservationRequired,
      finalAuthority: fixture.finalAuthority
    },
    hiddenFields: [...fixture.hiddenInternalFields],
    sourceFixtureId: fixture.fixtureId,
    readOnly: true,
    mayRenderReactUi: false,
    mayMutateSource: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAction: ""
  }) as AimPreviewPanelPacket;
}

export function buildQueueSummaryPreviewPanel(
  exportPacket: AimFixtureExportPacket,
  role: AimFixtureRole
): AimPreviewPanelPacket {
  return freezeDeep({
    panelId: "aim_preview_queue_summary_" + role,
    kind: "queue_summary_panel",
    role,
    title: "Queue Summary Preview",
    statusLabel: exportPacket.manifest.exportStatus,
    severity: exportPacket.manifest.exportStatus === "FIXTURE_EXPORT_READY" ? "success" : "neutral",
    summary: "Read-only queue summary prepared from fixture export packet.",
    displayFields: {
      totalDecisions: exportPacket.queueSummaryFixture.totalDecisions,
      totalJournals: exportPacket.queueSummaryFixture.totalJournals,
      finalAuthority: "Human",
      readOnly: true
    },
    hiddenFields: [],
    sourceFixtureId: exportPacket.queueSummaryFixture.fixtureId,
    readOnly: true,
    mayRenderReactUi: false,
    mayMutateSource: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAction: ""
  }) as AimPreviewPanelPacket;
}

export function buildEmptyPreviewPanel(role: AimFixtureRole): AimPreviewPanelPacket {
  return freezeDeep({
    panelId: "aim_preview_empty_" + role,
    kind: "empty_state_panel",
    role,
    title: "No AIM Preview Items",
    statusLabel: "PREVIEW_EMPTY",
    severity: "neutral",
    summary: "No decision or journal fixtures are available for preview.",
    displayFields: {
      emptyState: true,
      finalAuthority: "Human"
    },
    hiddenFields: [],
    sourceFixtureId: "none",
    readOnly: true,
    mayRenderReactUi: false,
    mayMutateSource: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAction: ""
  }) as AimPreviewPanelPacket;
}

export function buildErrorPreviewHarness(input: AimPreviewHarnessErrorInput): AimPreviewHarnessPacket {
  const panel = freezeDeep({
    panelId: "aim_preview_error_" + stableIdPart(input.errorCode),
    kind: "error_state_panel",
    role: input.role,
    title: "AIM Preview Error",
    statusLabel: input.errorCode,
    severity: "error",
    summary: input.errorMessage,
    displayFields: {
      errorCode: input.errorCode,
      errorMessage: input.errorMessage,
      finalAuthority: "Human"
    },
    hiddenFields: [],
    sourceFixtureId: input.sourceExportHash,
    readOnly: true,
    mayRenderReactUi: false,
    mayMutateSource: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAction: ""
  }) as AimPreviewPanelPacket;

  const hashSource = {
    status: "PREVIEW_ERROR",
    sourceExportHash: input.sourceExportHash,
    panel
  };

  return freezeDeep({
    previewHarnessId: "aim_preview_harness_error_" + stableIdPart(input.sourceExportHash),
    createdAt: input.createdAt,
    role: input.role,
    sourceExportHash: input.sourceExportHash,
    status: "PREVIEW_ERROR",
    panels: [panel],
    panelCount: 1,
    emptyState: false,
    errorState: true,
    previewHash: simpleDeterministicHash(hashSource),
    readOnly: true,
    deterministic: true,
    mayRenderReactUi: false,
    mayMutateState: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimPreviewHarnessPacket;
}

export function buildAimPreviewHarnessPacket(
  exportPacket: AimFixtureExportPacket,
  role: AimFixtureRole = "operator",
  createdAt = "2026-05-14T14:00:00.000Z"
): AimPreviewHarnessPacket {
  const status = mapFixtureExportStatusToPreviewStatus(exportPacket);

  const panels: AimPreviewPanelPacket[] = [
    buildManifestSummaryPanel(exportPacket, role),
    buildQueueSummaryPreviewPanel(exportPacket, role),
    ...exportPacket.decisionFixtures.map((fixture) => buildDecisionPreviewPanel(fixture)),
    ...exportPacket.journalFixtures.map((fixture) => buildJournalPreviewPanel(fixture))
  ];

  if (status === "PREVIEW_EMPTY") {
    panels.push(buildEmptyPreviewPanel(role));
  }

  const hashSource = {
    status,
    role,
    sourceExportHash: exportPacket.exportHash,
    panels
  };

  return freezeDeep({
    previewHarnessId: "aim_preview_harness_" + stableIdPart(exportPacket.exportHash) + "_" + role,
    createdAt,
    role,
    sourceExportHash: exportPacket.exportHash,
    status,
    panels,
    panelCount: panels.length,
    emptyState: status === "PREVIEW_EMPTY",
    errorState: false,
    previewHash: simpleDeterministicHash(hashSource),
    readOnly: true,
    deterministic: true,
    mayRenderReactUi: false,
    mayMutateState: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimPreviewHarnessPacket;
}