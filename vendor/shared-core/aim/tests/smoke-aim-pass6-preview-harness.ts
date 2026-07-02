import {
  AIM_PAI_SAFE_DECISION_STATUS,
  buildAimDecisionItem,
  buildAimFixtureExportPacket,
  buildAimJournalPacket,
  buildAimJournalPackets,
  buildAimPreviewHarnessPacket,
  buildErrorPreviewHarness,
  type AimStructuredDecisionInput
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const baseInput: AimStructuredDecisionInput = {
  sourceInputs: ["source_public_filing_001", "source_company_announcement_002"],
  departmentOrigin: "Infrastructure Mapping",
  agentOrigin: "Strategic Thinker AI",
  signalType: "infrastructure pressure",
  assetOrSubject: "HBM supply chain",
  thesisReference: "AIM-THESIS-HBM-001",
  evidenceSummary: "Multiple documented sources indicate HBM supply pressure and confirmed long-term allocation constraints.",
  evidenceStrength: "Strong",
  contradictionFlags: [],
  riskClass: "Moderate",
  timingContext: "Developing",
  urgencyLevel: "Medium",
  proposedAction: "Prepare human review packet for capital planning discussion.",
  documentationRefs: ["doc_hbm_001", "doc_hbm_002"],
  nextStep: "Human review only. Preserve journal before any decision."
};

const safeDecision = buildAimDecisionItem(baseInput);
const weakDecision = buildAimDecisionItem({
  ...baseInput,
  sourceInputs: ["single_unconfirmed_source"],
  evidenceStrength: "Weak"
});
const holdDecision = buildAimDecisionItem({
  ...baseInput,
  evidenceStrength: "Moderate"
});
const contradictionDecision = buildAimDecisionItem({
  ...baseInput,
  contradictionFlags: ["Contradiction present."],
  evidenceStrength: "Contradicted"
});

const decisions = [safeDecision, weakDecision, holdDecision, contradictionDecision];
const journals = buildAimJournalPackets(decisions);
const exportPacket = buildAimFixtureExportPacket(decisions, journals, "operator", "2026-05-14T13:00:00.000Z");

const previewA = buildAimPreviewHarnessPacket(exportPacket, "operator", "2026-05-14T14:00:00.000Z");
const previewB = buildAimPreviewHarnessPacket(exportPacket, "operator", "2026-05-14T14:00:00.000Z");

assert(previewA.previewHash === previewB.previewHash, "Preview output must be deterministic.");
assert(previewA.status === "PREVIEW_READY", "Mixed export with SAFE decision should create PREVIEW_READY.");
assert(previewA.panelCount === 10, "Preview should include manifest, queue summary, 4 decisions, and 4 journals.");
assert(previewA.panels.length === 10, "Panel length must match panel count.");
assert(previewA.emptyState === false, "Ready preview must not be empty.");
assert(previewA.errorState === false, "Ready preview must not be error.");
assert(previewA.readOnly === true, "Preview harness must be read-only.");
assert(previewA.deterministic === true, "Preview harness must be deterministic.");
assert(previewA.mayRenderReactUi === false, "Pass 6 must not render React UI.");
assert(previewA.mayMutateState === false, "Preview harness must not mutate state.");
assert(previewA.mayExecuteTrade === false, "Preview harness must not execute trade.");
assert(previewA.mayApproveInvestment === false, "Preview harness must not approve investment.");
assert(previewA.mayProvideFinancialAdvice === false, "Preview harness must not provide financial advice.");
assert(previewA.mayWriteSoul === false, "Preview harness must not write S:\\SOUL.");
assert(previewA.humanReviewRequired === true, "Preview harness must require human review.");
assert(previewA.finalAuthority === "Human", "Human authority must remain final.");
assert(previewA.finalAction === "", "Preview final action must remain blank.");
assert(Object.isFrozen(previewA), "Preview harness must be frozen.");
assert(Object.isFrozen(previewA.panels), "Preview panels array must be frozen.");

const decisionPanels = previewA.panels.filter((panel) => panel.kind === "decision_panel");
const journalPanels = previewA.panels.filter((panel) => panel.kind === "journal_panel");
const manifestPanels = previewA.panels.filter((panel) => panel.kind === "manifest_summary");
const queuePanels = previewA.panels.filter((panel) => panel.kind === "queue_summary_panel");

assert(decisionPanels.length === 4, "Four decision panels expected.");
assert(journalPanels.length === 4, "Four journal panels expected.");
assert(manifestPanels.length === 1, "One manifest panel expected.");
assert(queuePanels.length === 1, "One queue summary panel expected.");

assert(decisionPanels.some((panel) => panel.statusLabel === AIM_PAI_SAFE_DECISION_STATUS.SAFE_TO_REVIEW && panel.severity === "success"), "SAFE TO REVIEW should map to success preview.");
assert(decisionPanels.some((panel) => panel.statusLabel === AIM_PAI_SAFE_DECISION_STATUS.HOLD_FOR_CONFIRMATION && panel.severity === "warning"), "HOLD should map to warning preview.");
assert(decisionPanels.some((panel) => panel.statusLabel === AIM_PAI_SAFE_DECISION_STATUS.REFUSED_INSUFFICIENT_SIGNAL && panel.severity === "refused"), "REFUSED insufficient signal should map to refused preview.");
assert(decisionPanels.some((panel) => panel.statusLabel === AIM_PAI_SAFE_DECISION_STATUS.REFUSED_THESIS_CONTRADICTION && panel.severity === "refused"), "REFUSED thesis contradiction should map to refused preview.");

assert(journalPanels.some((panel) => panel.statusLabel === "JOURNAL_READY" && panel.severity === "success"), "JOURNAL_READY should map to success preview.");
assert(journalPanels.some((panel) => panel.statusLabel === "JOURNAL_HELD" && panel.severity === "warning"), "JOURNAL_HELD should map to warning preview.");
assert(journalPanels.some((panel) => panel.statusLabel === "JOURNAL_ARCHIVED_FOR_REVIEW" && panel.severity === "refused"), "JOURNAL_ARCHIVED should map to refused preview.");

for (const panel of previewA.panels) {
  assert(panel.readOnly === true, "Every preview panel must be read-only.");
  assert(panel.mayRenderReactUi === false, "No preview panel may render React UI.");
  assert(panel.mayMutateSource === false, "No preview panel may mutate source.");
  assert(panel.mayExecuteTrade === false, "No preview panel may execute trade.");
  assert(panel.mayApproveInvestment === false, "No preview panel may approve investment.");
  assert(panel.mayProvideFinancialAdvice === false, "No preview panel may provide financial advice.");
  assert(panel.mayWriteSoul === false, "No preview panel may write S:\\SOUL.");
  assert(panel.finalAction === "", "No preview panel may complete final action.");
  assert(Object.isFrozen(panel), "Every preview panel must be frozen.");
}

const operatorDecisionPanel = decisionPanels.find((panel) => panel.hiddenFields.includes("paiSafeReviewPacket.reasons"));
assert(operatorDecisionPanel !== undefined, "Operator preview must enforce hidden internal fields.");

const auditExport = buildAimFixtureExportPacket(decisions, journals, "audit", "2026-05-14T13:00:00.000Z");
const auditPreview = buildAimPreviewHarnessPacket(auditExport, "audit", "2026-05-14T14:00:00.000Z");
assert(auditPreview.panels.filter((panel) => panel.kind === "decision_panel").every((panel) => panel.hiddenFields.length === 0), "Audit decision preview should expose audit field policy.");

const emptyExport = buildAimFixtureExportPacket([], [], "operator", "2026-05-14T13:00:00.000Z");
const emptyPreview = buildAimPreviewHarnessPacket(emptyExport, "operator", "2026-05-14T14:00:00.000Z");
assert(emptyPreview.status === "PREVIEW_EMPTY", "Empty export should create PREVIEW_EMPTY.");
assert(emptyPreview.emptyState === true, "Empty preview should set empty state.");
assert(emptyPreview.errorState === false, "Empty preview should not be error.");
assert(emptyPreview.panels.some((panel) => panel.kind === "empty_state_panel"), "Empty preview should include empty-state panel.");

const refusedOnlyDecision = buildAimDecisionItem({
  ...baseInput,
  riskClass: "Excessive"
});
const refusedOnlyJournal = buildAimJournalPacket(refusedOnlyDecision);
const archivedExport = buildAimFixtureExportPacket([refusedOnlyDecision], [refusedOnlyJournal], "operator", "2026-05-14T13:00:00.000Z");
const archivedPreview = buildAimPreviewHarnessPacket(archivedExport, "operator", "2026-05-14T14:00:00.000Z");
assert(archivedPreview.status === "PREVIEW_ARCHIVED", "Refused-only export should create PREVIEW_ARCHIVED.");
assert(archivedPreview.panels.some((panel) => panel.severity === "refused"), "Archived preview should include refused severity.");

const errorPreview = buildErrorPreviewHarness({
  role: "operator",
  createdAt: "2026-05-14T14:00:00.000Z",
  sourceExportHash: "bad_export_hash",
  errorCode: "INVALID_FIXTURE_PACKET",
  errorMessage: "Fixture packet failed preview harness validation."
});

assert(errorPreview.status === "PREVIEW_ERROR", "Error preview should create PREVIEW_ERROR.");
assert(errorPreview.errorState === true, "Error preview should set error state.");
assert(errorPreview.emptyState === false, "Error preview should not be empty.");
assert(errorPreview.panels.length === 1, "Error preview should contain one panel.");
assert(errorPreview.panels[0]?.kind === "error_state_panel", "Error preview should contain error panel.");
assert(errorPreview.mayRenderReactUi === false, "Error preview must not render UI.");
assert(errorPreview.mayMutateState === false, "Error preview must not mutate state.");
assert(errorPreview.mayExecuteTrade === false, "Error preview must not execute trade.");
assert(errorPreview.finalAction === "", "Error preview final action must remain blank.");

console.log("AIM_PASS_6_PREVIEW_HARNESS_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "preview harness packet created",
      "preview output hash deterministic",
      "role-specific preview panels created",
      "manifest summary panel created",
      "queue summary panel created",
      "decision panels created",
      "journal panels created",
      "SAFE TO REVIEW maps to success",
      "HOLD FOR CONFIRMATION maps to warning",
      "REFUSED maps to refused",
      "JOURNAL_READY maps to success",
      "JOURNAL_HELD maps to warning",
      "JOURNAL_ARCHIVED maps to refused",
      "operator hidden-field enforcement works",
      "audit hidden-field policy works",
      "empty preview state works",
      "archived preview state works",
      "error preview state works",
      "preview harness frozen",
      "preview panels frozen",
      "no React UI render authority",
      "no state mutation authority",
      "no trade execution",
      "no investment approval",
      "no financial advice",
      "no S:\\SOUL write",
      "final action remains blank",
      "human authority remains final"
    ],
    previewHash: previewA.previewHash,
    previewStatus: previewA.status,
    panelCount: previewA.panelCount
  },
  null,
  2
));