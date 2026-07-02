import {
  buildAimFeedbackSummaryPacket,
  buildAimHumanReviewOutcomePacket,
  buildAimLocalRecordPacket,
  buildAimOperatorEndToEndLocalFlow,
  buildAimPreviewRecordViewerPacket,
  buildAimShellAdapterPacket,
  buildAimWatchlistThesisItem,
  verifyAimPreviewRecordViewerGovernance
} from "../src/index.js";
import { validDraft } from "./aim-test-draft.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const flow = buildAimOperatorEndToEndLocalFlow(validDraft);
const localRecord = buildAimLocalRecordPacket(flow);
const watchlistItem = buildAimWatchlistThesisItem(localRecord, 1);

const review = buildAimHumanReviewOutcomePacket(
  localRecord,
  "HUMAN_CONFIRMED_LEARNING",
  "THESIS_STRENGTHENED",
  "Human confirmed this as a review artifact.",
  "Viewer preserves record and journal references.",
  "Keep viewer read-only.",
  ""
);

const feedbackSummary = buildAimFeedbackSummaryPacket([localRecord], [watchlistItem], [review]);
const shellAdapter = buildAimShellAdapterPacket({ flow, localRecord, watchlistItem, feedbackSummary });

const viewerA = buildAimPreviewRecordViewerPacket({ flow, localRecord, shellAdapter });
const viewerB = buildAimPreviewRecordViewerPacket({ flow, localRecord, shellAdapter });
const governance = verifyAimPreviewRecordViewerGovernance(viewerA);

assert(viewerA.viewerHash === viewerB.viewerHash, "Viewer hash must be deterministic.");
assert(viewerA.status === "VIEWER_READY", "Safe complete flow should create ready viewer.");
assert(viewerA.title === "AIM Preview + Record Viewer", "Viewer title must be locked.");
assert(viewerA.sourceFlowId === flow.flowId, "Viewer must preserve source flow ID.");
assert(viewerA.sourceFlowHash === flow.flowHash, "Viewer must preserve source flow hash.");
assert(viewerA.sourceShellAdapterId === shellAdapter.shellAdapterId, "Viewer must preserve shell adapter ID.");
assert(viewerA.sourceRecordId === localRecord.recordId, "Viewer must preserve local record ID.");
assert(viewerA.sourceDecisionId === flow.decisionItem?.decisionId, "Viewer must preserve decision ID.");
assert(viewerA.sourceJournalPacketId === flow.journalPacket?.journalPacketId, "Viewer must preserve journal packet ID.");
assert(viewerA.sourceStaticRenderId === flow.staticRender?.staticRenderId, "Viewer must preserve static render ID.");
assert(viewerA.sourcePreviewHash === flow.staticRender?.sourcePreviewHash, "Viewer must preserve preview hash.");
assert(viewerA.sectionCount === 8, "Viewer must expose eight sections.");
assert(viewerA.sections.length === 8, "Viewer section count must match.");

const byKind = new Map(viewerA.sections.map((section) => [section.kind, section]));

assert(byKind.has("viewer_status"), "Viewer status section required.");
assert(byKind.has("static_preview"), "Static preview section required.");
assert(byKind.has("local_record"), "Local record section required.");
assert(byKind.has("journal_reference"), "Journal reference section required.");
assert(byKind.has("decision_snapshot"), "Decision snapshot section required.");
assert(byKind.has("pai_safe_state"), "PAI-SAFE state section required.");
assert(byKind.has("record_path"), "Record path section required.");
assert(byKind.has("human_review_boundary"), "Human review boundary section required.");

assert(byKind.get("static_preview")?.displayFields.staticRenderId === flow.staticRender?.staticRenderId, "Static preview section must preserve static render ID.");
assert(byKind.get("local_record")?.displayFields.recordId === localRecord.recordId, "Local record section must preserve record ID.");
assert(byKind.get("journal_reference")?.displayFields.journalPacketId === flow.journalPacket?.journalPacketId, "Journal section must preserve journal ID.");
assert(byKind.get("decision_snapshot")?.displayFields.decisionId === flow.decisionItem?.decisionId, "Decision section must preserve decision ID.");
assert(byKind.get("pai_safe_state")?.displayFields.paiSafeStatus === flow.decisionItem?.paiSafeStatus, "PAI-SAFE section must preserve readiness status.");
assert(byKind.get("record_path")?.displayFields.localRecordPath === localRecord.localRecordPath, "Record path section must preserve local record path.");
assert(byKind.get("human_review_boundary")?.displayFields.finalAuthority === "Human", "Human review boundary must preserve human authority.");

assert(viewerA.htmlPreview.includes("AIM Preview + Record Viewer"), "HTML preview must show viewer title.");
assert(viewerA.htmlPreview.includes("data-aim-preview-record-viewer=\"true\""), "HTML preview must include viewer root.");
assert(viewerA.htmlPreview.includes("Read-only viewer"), "HTML preview must show read-only viewer language.");

assert(viewerA.readOnly === true, "Viewer must be read-only.");
assert(viewerA.deterministic === true, "Viewer must be deterministic.");
assert(viewerA.controlledVisibilityOnly === true, "Viewer must be controlled visibility only.");
assert(viewerA.localOnly === true, "Viewer must be local-only.");
assert(viewerA.mayMutatePreview === false, "Viewer must not mutate preview.");
assert(viewerA.mayMutateRecord === false, "Viewer must not mutate record.");
assert(viewerA.mayMutateJournal === false, "Viewer must not mutate journal.");
assert(viewerA.mayMutateAimOutput === false, "Viewer must not mutate AIM output.");
assert(viewerA.mayCreateTruth === false, "Viewer must not create truth.");
assert(viewerA.mayGovern === false, "Viewer must not govern.");
assert(viewerA.mayApproveDecision === false, "Viewer must not approve decisions.");
assert(viewerA.mayExecuteTrade === false, "Viewer must not execute trades.");
assert(viewerA.mayProvideFinancialAdvice === false, "Viewer must not provide financial advice.");
assert(viewerA.mayUseLiveData === false, "Viewer must not use live data.");
assert(viewerA.mayCallExternalApi === false, "Viewer must not call external APIs.");
assert(viewerA.finalAuthority === "Human", "Viewer must preserve human authority.");
assert(viewerA.finalAction === "", "Viewer final action must remain blank.");
assert(Object.isFrozen(viewerA), "Viewer packet must be frozen.");
assert(Object.isFrozen(viewerA.sections), "Viewer sections must be frozen.");

for (const [check, passed] of Object.entries(governance.checks)) {
  assert(passed === true, "Viewer governance check failed: " + check);
}

assert(governance.status === "VIEWER_GOVERNANCE_VERIFIED", "Viewer governance must verify.");
assert(governance.refusalReasons.length === 0, "Viewer governance should have no refusal reasons.");

const refusedFlow = buildAimOperatorEndToEndLocalFlow({
  ...validDraft,
  draftId: "draft_viewer_refused_001",
  proposedAction: "Buy now and execute trade immediately."
});

const refusedRecord = buildAimLocalRecordPacket(refusedFlow);
const refusedShell = buildAimShellAdapterPacket({ flow: refusedFlow, localRecord: refusedRecord });
const refusedViewer = buildAimPreviewRecordViewerPacket({
  flow: refusedFlow,
  localRecord: refusedRecord,
  shellAdapter: refusedShell
});
const refusedGovernance = verifyAimPreviewRecordViewerGovernance(refusedViewer);

assert(refusedViewer.status === "VIEWER_REFUSED", "Refused flow should create refused viewer.");
assert(refusedViewer.sourceDecisionId === "", "Refused viewer must not invent decision ID.");
assert(refusedViewer.sourceJournalPacketId === "", "Refused viewer must not invent journal ID.");
assert(refusedViewer.mayExecuteTrade === false, "Refused viewer must not execute trades.");
assert(refusedViewer.finalAction === "", "Refused viewer final action must remain blank.");
assert(refusedGovernance.status === "VIEWER_GOVERNANCE_VERIFIED", "Refused viewer must still pass governance.");

assert(flow.decisionItem?.decisionId === viewerA.sourceDecisionId, "Viewer must not mutate source decision ID.");
assert(flow.journalPacket?.journalPacketId === viewerA.sourceJournalPacketId, "Viewer must not mutate source journal ID.");
assert(flow.staticRender?.staticRenderId === viewerA.sourceStaticRenderId, "Viewer must not mutate static render ID.");
assert(localRecord.recordId === viewerA.sourceRecordId, "Viewer must not mutate local record ID.");

console.log("AIM_V02_PREVIEW_RECORD_VIEWER_SPRINT3_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "preview record viewer packet created",
      "viewer hash deterministic",
      "static preview reference visible",
      "local record visible",
      "journal reference visible",
      "decision snapshot visible",
      "PAI-SAFE state visible",
      "record path visible",
      "human review boundary visible",
      "HTML preview created",
      "ready viewer works",
      "refused viewer works",
      "viewer governance verifies",
      "viewer packet frozen",
      "viewer sections frozen",
      "no preview mutation",
      "no record mutation",
      "no journal mutation",
      "no AIM output mutation",
      "no truth creation",
      "no governance authority",
      "no decision approval",
      "no trade execution",
      "no financial advice",
      "no live data",
      "no external API",
      "final action remains blank",
      "human authority remains final"
    ],
    viewerStatus: viewerA.status,
    viewerHash: viewerA.viewerHash,
    sectionCount: viewerA.sectionCount,
    refusedViewerStatus: refusedViewer.status
  },
  null,
  2
));