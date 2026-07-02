import {
  buildAimFeedbackSummaryPacket,
  buildAimHumanReviewOutcomePacket,
  buildAimLocalOperatorViewPacket,
  buildAimLocalRecordPacket,
  buildAimOperatorEndToEndLocalFlow,
  buildAimShellAdapterPacket,
  buildAimWatchlistThesisItem,
  verifyAimShellReadOnlyGovernance
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
  "Structured evidence improved clarity.",
  "Keep all future shell views read-only.",
  ""
);

const feedbackSummary = buildAimFeedbackSummaryPacket([localRecord], [watchlistItem], [review]);

const originalDecisionId = flow.decisionItem?.decisionId || "";
const originalPaiSafeStatus = flow.decisionItem?.paiSafeStatus || "";
const originalJournalId = flow.journalPacket?.journalPacketId || "";
const originalJournalStatus = flow.journalPacket?.status || "";
const originalEvidenceSummary = flow.decisionItem?.evidenceSummary || "";
const originalContradictionCount = flow.decisionItem?.contradictionFlags.length || 0;

const adapterA = buildAimShellAdapterPacket({
  flow,
  localRecord,
  watchlistItem,
  feedbackSummary
});

const adapterB = buildAimShellAdapterPacket({
  flow,
  localRecord,
  watchlistItem,
  feedbackSummary
});

const view = buildAimLocalOperatorViewPacket(adapterA);
const governance = verifyAimShellReadOnlyGovernance(adapterA, view);

assert(adapterA.shellHash === adapterB.shellHash, "Shell adapter hash must be deterministic.");
assert(adapterA.status === "AIM_SHELL_CONNECTED", "Shell adapter should connect to verified AIM v0.1 output.");
assert(adapterA.product === "AIM — AI MarketIntel", "AIM product name must remain unchanged.");
assert(adapterA.version === "v0.2-shell-sprint1", "Shell sprint version must be locked.");
assert(adapterA.sectionCount === 9, "Shell adapter must expose nine required sections.");

const byKind = new Map(adapterA.sections.map((section) => [section.kind, section]));

assert(byKind.has("aim_status"), "AIM status section required.");
assert(byKind.has("decision_queue"), "Decision Queue section required.");
assert(byKind.has("pai_safe_review"), "PAI-SAFE review state section required.");
assert(byKind.has("refusal_hold_reasons"), "Refusal / Hold reasons section required.");
assert(byKind.has("evidence_summary"), "Evidence summary section required.");
assert(byKind.has("risk_contradiction_flags"), "Risk / contradiction flags section required.");
assert(byKind.has("human_review"), "Human review section required.");
assert(byKind.has("journal_reference"), "Journal reference section required.");
assert(byKind.has("next_operator_action"), "Next operator action section required.");

assert(byKind.get("decision_queue")?.displayFields.decisionId === originalDecisionId, "Decision queue must preserve original decision ID.");
assert(byKind.get("decision_queue")?.statusLabel === originalPaiSafeStatus, "Decision queue must display original PAI-SAFE status.");
assert(byKind.get("pai_safe_review")?.displayFields.paiSafeStatus === originalPaiSafeStatus, "PAI-SAFE section must display original readiness status.");
assert(byKind.get("journal_reference")?.displayFields.journalPacketId === originalJournalId, "Journal section must preserve original journal reference.");
assert(byKind.get("journal_reference")?.displayFields.journalStatus === originalJournalStatus, "Journal section must preserve original journal status.");
assert(byKind.get("evidence_summary")?.displayFields.evidenceSummary === originalEvidenceSummary, "Evidence summary must preserve original evidence summary.");
assert(byKind.get("risk_contradiction_flags")?.displayFields.contradictionFlags === "", "Contradiction flags should display safely when none exist.");
assert(byKind.get("refusal_hold_reasons")?.displayFields.contradictionFlagCount === originalContradictionCount, "Contradiction count must preserve original value.");
assert(byKind.get("human_review")?.displayFields.humanReviewRequired === true, "Human review requirement must be visible.");
assert(byKind.get("next_operator_action")?.displayFields.actionBoundary === "Review only. No execution authority.", "Next action must preserve review-only boundary.");

for (const [check, passed] of Object.entries(governance)) {
  assert(passed === true, "Read-only governance check failed: " + check);
}

assert(adapterA.readOnly === true, "Adapter must be read-only.");
assert(adapterA.deterministic === true, "Adapter must be deterministic.");
assert(adapterA.controlledVisibilityOnly === true, "Adapter must be controlled visibility only.");
assert(adapterA.preservesOriginalValues === true, "Adapter must preserve original values.");
assert(adapterA.mayMutateAimOutput === false, "Adapter must not mutate AIM output.");
assert(adapterA.mayMutateJournal === false, "Adapter must not mutate journal.");
assert(adapterA.mayCreateTruth === false, "Adapter must not create truth.");
assert(adapterA.mayGovern === false, "Adapter must not govern.");
assert(adapterA.mayApproveDecision === false, "Adapter must not approve decisions.");
assert(adapterA.mayExecuteTrade === false, "Adapter must not execute trades.");
assert(adapterA.mayProvideFinancialAdvice === false, "Adapter must not provide financial advice.");
assert(adapterA.mayUseLiveData === false, "Adapter must not use live data.");
assert(adapterA.mayCallExternalApi === false, "Adapter must not call external APIs.");
assert(adapterA.finalAuthority === "Human", "Human authority must remain final.");
assert(adapterA.finalAction === "", "Adapter final action must remain blank.");
assert(Object.isFrozen(adapterA), "Adapter packet must be frozen.");
assert(Object.isFrozen(adapterA.sections), "Adapter sections must be frozen.");

assert(view.title === "AIM — AI MarketIntel", "Local operator view title must preserve AIM brand.");
assert(view.minimalView === true, "Local operator view must be minimal.");
assert(view.mayRedesignDashboard === false, "Local operator view must not redesign dashboard.");
assert(view.htmlPreview.includes("AIM — AI MarketIntel"), "HTML preview must show AIM brand.");
assert(view.htmlPreview.includes("Controlled visibility only"), "HTML preview must show controlled visibility language.");
assert(view.htmlPreview.includes("data-aim-shell-view=\"true\""), "HTML preview must include shell view root.");
assert(view.readOnly === true, "View must be read-only.");
assert(view.mayMutateAimOutput === false, "View must not mutate AIM output.");
assert(view.mayMutateJournal === false, "View must not mutate journal.");
assert(view.mayExecuteTrade === false, "View must not execute trades.");
assert(view.mayApproveDecision === false, "View must not approve decisions.");
assert(view.mayProvideFinancialAdvice === false, "View must not provide financial advice.");
assert(view.mayUseLiveData === false, "View must not use live data.");
assert(view.finalAuthority === "Human", "View must preserve human authority.");
assert(view.finalAction === "", "View final action must remain blank.");
assert(Object.isFrozen(view), "View packet must be frozen.");

const refusedFlow = buildAimOperatorEndToEndLocalFlow({
  ...validDraft,
  draftId: "draft_shell_refused_001",
  proposedAction: "Buy now and execute trade immediately."
});

const refusedAdapter = buildAimShellAdapterPacket({ flow: refusedFlow });
const refusedView = buildAimLocalOperatorViewPacket(refusedAdapter);
const refusedGovernance = verifyAimShellReadOnlyGovernance(refusedAdapter, refusedView);

assert(refusedAdapter.status === "AIM_SHELL_REFUSED", "Refused input should create refused shell state.");
assert(refusedAdapter.sourceDecisionId === "", "Refused shell state must not invent decision ID.");
assert(refusedAdapter.sourceJournalPacketId === "", "Refused shell state must not invent journal ID.");
assert(refusedAdapter.sections.length === 9, "Refused shell still shows bounded sections.");

for (const [check, passed] of Object.entries(refusedGovernance)) {
  assert(passed === true, "Refused shell governance check failed: " + check);
}

assert(flow.decisionItem?.decisionId === originalDecisionId, "Shell adapter must not mutate source decision ID.");
assert(flow.decisionItem?.paiSafeStatus === originalPaiSafeStatus, "Shell adapter must not mutate source PAI-SAFE status.");
assert(flow.journalPacket?.journalPacketId === originalJournalId, "Shell adapter must not mutate source journal reference.");
assert(flow.journalPacket?.status === originalJournalStatus, "Shell adapter must not mutate source journal status.");

console.log("AIM_V02_SHELL_CONNECTION_SPRINT1_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "AIM v0.1 output loaded",
      "shell adapter created",
      "local operator view created",
      "AIM product name preserved",
      "decision queue visible",
      "PAI-SAFE readiness visible",
      "refusal and hold section visible",
      "evidence summary visible",
      "risk and contradiction flags visible",
      "human review requirement visible",
      "journal reference visible",
      "next operator action visible",
      "original decision values preserved",
      "original journal values preserved",
      "adapter frozen",
      "view frozen",
      "refused shell state works",
      "read-only governance verified",
      "no AIM output mutation",
      "no journal mutation",
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
    shellStatus: adapterA.status,
    shellHash: adapterA.shellHash,
    sectionCount: adapterA.sectionCount,
    refusedShellStatus: refusedAdapter.status
  },
  null,
  2
));