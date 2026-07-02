import {
  AIM_PAI_SAFE_DECISION_STATUS,
  buildAimDecisionItem,
  buildAimFixtureExportPacket,
  buildAimJournalPacket,
  buildAimJournalPackets,
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

const exportA = buildAimFixtureExportPacket(decisions, journals, "operator", "2026-05-14T13:00:00.000Z");
const exportB = buildAimFixtureExportPacket(decisions, journals, "operator", "2026-05-14T13:00:00.000Z");

assert(exportA.exportHash === exportB.exportHash, "Fixture export must be deterministic.");
assert(exportA.manifest.exportStatus === "FIXTURE_EXPORT_READY", "Export should be ready when one decision is SAFE TO REVIEW.");
assert(exportA.manifest.fixtureCount === 9, "Fixture count should equal decisions + journals + summary.");
assert(exportA.manifest.decisionCount === 4, "Decision count should be 4.");
assert(exportA.manifest.journalCount === 4, "Journal count should be 4.");
assert(exportA.decisionFixtures.length === 4, "Decision fixtures should be exported.");
assert(exportA.journalFixtures.length === 4, "Journal fixtures should be exported.");
assert(exportA.queueSummaryFixture.totalDecisions === 4, "Queue summary should preserve decision count.");
assert(exportA.queueSummaryFixture.totalJournals === 4, "Queue summary should preserve journal count.");

assert(exportA.queueSummaryFixture.decisionStatusCounts[AIM_PAI_SAFE_DECISION_STATUS.SAFE_TO_REVIEW] === 1, "Summary should contain one SAFE TO REVIEW.");
assert(exportA.queueSummaryFixture.decisionStatusCounts[AIM_PAI_SAFE_DECISION_STATUS.HOLD_FOR_CONFIRMATION] === 1, "Summary should contain one HOLD.");
assert(exportA.queueSummaryFixture.decisionStatusCounts[AIM_PAI_SAFE_DECISION_STATUS.REFUSED_INSUFFICIENT_SIGNAL] === 1, "Summary should contain one insufficient signal refusal.");
assert(exportA.queueSummaryFixture.decisionStatusCounts[AIM_PAI_SAFE_DECISION_STATUS.REFUSED_THESIS_CONTRADICTION] === 1, "Summary should contain one contradiction refusal.");

assert(exportA.queueSummaryFixture.journalStatusCounts.JOURNAL_READY === 1, "Journal summary should contain one ready journal.");
assert(exportA.queueSummaryFixture.journalStatusCounts.JOURNAL_HELD === 1, "Journal summary should contain one held journal.");
assert(exportA.queueSummaryFixture.journalStatusCounts.JOURNAL_ARCHIVED_FOR_REVIEW === 2, "Journal summary should contain two archived journals.");

assert(exportA.readOnly === true, "Export must be read-only.");
assert(exportA.deterministic === true, "Export must declare deterministic behavior.");
assert(exportA.preservationRequired === true, "Export must require preservation.");
assert(exportA.humanReviewRequired === true, "Export must require human review.");
assert(exportA.finalAuthority === "Human", "Human authority must remain final.");
assert(exportA.mayRenderUi === false, "Pass 5 must not render UI.");
assert(exportA.mayMutateState === false, "Export must not mutate state.");
assert(exportA.mayExecuteTrade === false, "Export must not execute trade.");
assert(exportA.mayApproveInvestment === false, "Export must not approve investment.");
assert(exportA.mayProvideFinancialAdvice === false, "Export must not provide financial advice.");
assert(exportA.mayWriteSoul === false, "Export must not write to S:\\SOUL.");
assert(exportA.finalAction === "", "Export final action must remain blank.");

assert(Object.isFrozen(exportA), "Export packet must be frozen.");
assert(Object.isFrozen(exportA.manifest), "Manifest must be frozen.");
assert(Object.isFrozen(exportA.decisionFixtures), "Decision fixture array must be frozen.");
assert(Object.isFrozen(exportA.journalFixtures), "Journal fixture array must be frozen.");
assert(Object.isFrozen(exportA.queueSummaryFixture), "Queue summary fixture must be frozen.");

for (const fixture of exportA.decisionFixtures) {
  assert(fixture.readOnly === true, "Decision fixture must be read-only.");
  assert(fixture.mayMutateSource === false, "Decision fixture must not mutate source.");
  assert(fixture.mayExecuteTrade === false, "Decision fixture must not execute trade.");
  assert(fixture.mayApproveInvestment === false, "Decision fixture must not approve investment.");
  assert(fixture.mayProvideFinancialAdvice === false, "Decision fixture must not provide financial advice.");
  assert(fixture.finalAction === "", "Decision fixture final action must remain blank.");
  assert(Object.isFrozen(fixture), "Decision fixture must be frozen.");
}

for (const fixture of exportA.journalFixtures) {
  assert(fixture.readOnly === true, "Journal fixture must be read-only.");
  assert(fixture.mayMutateSource === false, "Journal fixture must not mutate source.");
  assert(fixture.executionAuthorized === false, "Journal fixture must not authorize execution.");
  assert(fixture.tradeRecommendation === null, "Journal fixture must not recommend trade.");
  assert(fixture.financialAdviceProvided === false, "Journal fixture must not provide financial advice.");
  assert(fixture.finalAction === "", "Journal fixture final action must remain blank.");
  assert(Object.isFrozen(fixture), "Journal fixture must be frozen.");
}

const auditExport = buildAimFixtureExportPacket(decisions, journals, "audit", "2026-05-14T13:00:00.000Z");
assert(auditExport.manifest.hiddenFieldPolicy === "SHOW_AUDIT_FIELDS", "Audit export should show audit field policy.");
assert(auditExport.decisionFixtures.every((fixture) => fixture.hiddenInternalFields.length === 0), "Audit decision fixtures should not hide internal fields.");
assert(auditExport.journalFixtures.every((fixture) => fixture.hiddenInternalFields.length === 0), "Audit journal fixtures should not hide internal fields.");

const operatorExport = buildAimFixtureExportPacket(decisions, journals, "operator", "2026-05-14T13:00:00.000Z");
assert(operatorExport.manifest.hiddenFieldPolicy === "HIDE_INTERNAL_REASONS", "Operator export should hide internal reasons.");
assert(operatorExport.decisionFixtures.some((fixture) => fixture.hiddenInternalFields.includes("paiSafeReviewPacket.reasons")), "Operator decision fixture should hide readiness reasons.");

const emptyExport = buildAimFixtureExportPacket([], [], "operator", "2026-05-14T13:00:00.000Z");
assert(emptyExport.manifest.exportStatus === "FIXTURE_EXPORT_EMPTY", "Empty export must be marked empty.");
assert(emptyExport.decisionFixtures.length === 0, "Empty export must contain no decision fixtures.");
assert(emptyExport.journalFixtures.length === 0, "Empty export must contain no journal fixtures.");
assert(emptyExport.queueSummaryFixture.totalDecisions === 0, "Empty summary decision count must be zero.");
assert(emptyExport.queueSummaryFixture.totalJournals === 0, "Empty summary journal count must be zero.");

const refusedOnlyDecision = buildAimDecisionItem({
  ...baseInput,
  riskClass: "Excessive"
});
const refusedOnlyJournal = buildAimJournalPacket(refusedOnlyDecision);
const archivedExport = buildAimFixtureExportPacket([refusedOnlyDecision], [refusedOnlyJournal], "operator", "2026-05-14T13:00:00.000Z");
assert(archivedExport.manifest.exportStatus === "FIXTURE_EXPORT_ARCHIVED", "Refused-only export should be archived.");

console.log("AIM_PASS_5_FIXTURE_EXPORT_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "fixture export packet created",
      "manifest created",
      "decision fixtures exported",
      "journal fixtures exported",
      "queue summary fixture exported",
      "export hash deterministic",
      "operator hidden field policy works",
      "audit hidden field policy works",
      "empty export safe",
      "refused-only export archived",
      "fixtures are frozen",
      "export is read-only",
      "no UI render authority",
      "no state mutation authority",
      "no trade execution",
      "no investment approval",
      "no financial advice",
      "no S:\\SOUL write",
      "final action remains blank",
      "human authority remains final"
    ],
    exportHash: exportA.exportHash,
    exportStatus: exportA.manifest.exportStatus
  },
  null,
  2
));