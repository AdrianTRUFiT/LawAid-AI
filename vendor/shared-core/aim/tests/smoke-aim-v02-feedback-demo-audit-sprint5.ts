import {
  buildAimFeedbackSummaryPacket,
  buildAimHumanReviewOutcomePacket,
  buildAimLocalRecordPacket,
  buildAimOperatorEndToEndLocalFlow,
  buildAimManualIntakeUiPacket,
  buildAimPreviewRecordViewerPacket,
  buildAimProductReadinessAuditPacket,
  buildAimShellAdapterPacket,
  buildAimV02FeedbackDemoAuditPacket,
  buildAimWatchlistReviewViewPacket,
  buildAimWatchlistThesisItem,
  verifyAimV02FeedbackDemoAuditGovernance
} from "../src/index.js";
import { validDraft } from "./aim-test-draft.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const flow = buildAimOperatorEndToEndLocalFlow(validDraft);
const localRecord = buildAimLocalRecordPacket(flow);
const watchlistItem = buildAimWatchlistThesisItem(localRecord, 2);

const reviewA = buildAimHumanReviewOutcomePacket(
  localRecord,
  "HUMAN_CONFIRMED_LEARNING",
  "THESIS_STRENGTHENED",
  "Human confirmed this as a learning artifact.",
  "Strong evidence improves review clarity.",
  "Keep requiring source confirmation before review escalation.",
  ""
);

const reviewB = buildAimHumanReviewOutcomePacket(
  localRecord,
  "HUMAN_REVIEWED_NO_ACTION",
  "RISK_REDUCED",
  "Human reviewed and took no action.",
  "Risk reduced after contradiction check.",
  "Separate market excitement from documented dependency.",
  ""
);

const feedbackSummary = buildAimFeedbackSummaryPacket([localRecord], [watchlistItem], [reviewA, reviewB]);
const productReadiness = buildAimProductReadinessAuditPacket({
  flow,
  localRecord,
  watchlistItem,
  humanReviews: [reviewA, reviewB],
  feedbackSummary
});
const shellAdapter = buildAimShellAdapterPacket({ flow, localRecord, watchlistItem, feedbackSummary });
const intakeUi = buildAimManualIntakeUiPacket(validDraft);
const previewRecordViewer = buildAimPreviewRecordViewerPacket({ flow, localRecord, shellAdapter });
const watchlistReviewView = buildAimWatchlistReviewViewPacket({
  watchlistItem,
  localRecord,
  reviewOutcome: reviewA,
  viewerPacket: previewRecordViewer
});

const demoA = buildAimV02FeedbackDemoAuditPacket({
  productReadiness,
  feedbackSummary,
  shellAdapter,
  intakeUi,
  previewRecordViewer,
  watchlistReviewView
});

const demoB = buildAimV02FeedbackDemoAuditPacket({
  productReadiness,
  feedbackSummary,
  shellAdapter,
  intakeUi,
  previewRecordViewer,
  watchlistReviewView
});

const governance = verifyAimV02FeedbackDemoAuditGovernance(demoA);

assert(demoA.demoHash === demoB.demoHash, "Demo audit hash must be deterministic.");
assert(demoA.status === "AIM_V0_2_DEMO_READY", "Complete v0.2 chain should create ready demo audit.");
assert(demoA.product === "AIM — AI MarketIntel", "AIM product name must remain unchanged.");
assert(demoA.version === "v0.2-demo-audit", "Demo audit version must be locked.");
assert(demoA.sourceProductReadinessAuditId === productReadiness.auditId, "Demo audit must preserve product readiness audit ID.");
assert(demoA.sourceFeedbackSummaryId === feedbackSummary.summaryId, "Demo audit must preserve feedback summary ID.");
assert(demoA.sourceShellAdapterId === shellAdapter.shellAdapterId, "Demo audit must preserve shell adapter ID.");
assert(demoA.sourceIntakeUiId === intakeUi.uiId, "Demo audit must preserve intake UI ID.");
assert(demoA.sourcePreviewRecordViewerId === previewRecordViewer.viewerId, "Demo audit must preserve preview record viewer ID.");
assert(demoA.sourceWatchlistReviewViewId === watchlistReviewView.viewId, "Demo audit must preserve watchlist review view ID.");
assert(demoA.readinessScore === 100, "Demo audit must preserve readiness score.");
assert(demoA.demoCompletenessScore === 100, "Complete demo audit should score 100.");
assert(demoA.sectionCount === 9, "Demo audit must expose nine sections.");
assert(demoA.sections.length === 9, "Demo audit section count must match.");

const byKind = new Map(demoA.sections.map((section) => [section.kind, section]));

assert(byKind.has("demo_status"), "Demo status section required.");
assert(byKind.has("product_readiness"), "Product readiness section required.");
assert(byKind.has("feedback_summary"), "Feedback summary section required.");
assert(byKind.has("shell_connection"), "Shell connection section required.");
assert(byKind.has("manual_intake_ui"), "Manual intake UI section required.");
assert(byKind.has("preview_record_viewer"), "Preview record viewer section required.");
assert(byKind.has("watchlist_review"), "Watchlist review section required.");
assert(byKind.has("learning_loop"), "Learning loop section required.");
assert(byKind.has("authority_boundary"), "Authority boundary section required.");

assert(byKind.get("product_readiness")?.displayFields.readinessScore === 100, "Product readiness score must be visible.");
assert(byKind.get("feedback_summary")?.displayFields.reviewCount === feedbackSummary.reviewCount, "Feedback review count must be visible.");
assert(byKind.get("shell_connection")?.displayFields.shellAdapterId === shellAdapter.shellAdapterId, "Shell adapter reference must be visible.");
assert(byKind.get("manual_intake_ui")?.displayFields.uiId === intakeUi.uiId, "Intake UI reference must be visible.");
assert(byKind.get("preview_record_viewer")?.displayFields.viewerId === previewRecordViewer.viewerId, "Preview viewer reference must be visible.");
assert(byKind.get("watchlist_review")?.displayFields.viewId === watchlistReviewView.viewId, "Watchlist review reference must be visible.");
assert(byKind.get("learning_loop")?.displayFields.latestLessonCount === feedbackSummary.latestLessons.length, "Latest lessons count must be visible.");
assert(byKind.get("authority_boundary")?.displayFields.finalAuthority === "Human", "Authority boundary must preserve human authority.");
assert(byKind.get("authority_boundary")?.displayFields.actionBoundary === "Demo and audit only. No approval, advice, execution, mutation, or live data authority.", "Authority boundary must block execution authority.");

assert(demoA.htmlPreview.includes("AIM v0.2 Feedback Summary + Product Demo Audit"), "HTML preview must show demo audit title.");
assert(demoA.htmlPreview.includes("data-aim-v02-demo-audit=\"true\""), "HTML preview must include demo audit root.");
assert(demoA.htmlPreview.includes("Feedback is summarized for human review only"), "HTML preview must show feedback boundary language.");

assert(demoA.readOnly === true, "Demo audit must be read-only.");
assert(demoA.deterministic === true, "Demo audit must be deterministic.");
assert(demoA.controlledDemoOnly === true, "Demo audit must be controlled demo only.");
assert(demoA.localOnly === true, "Demo audit must be local-only.");
assert(demoA.mayMutateFeedback === false, "Demo audit must not mutate feedback.");
assert(demoA.mayMutateAudit === false, "Demo audit must not mutate audit.");
assert(demoA.mayMutateDemo === false, "Demo audit must not mutate demo.");
assert(demoA.mayMutateAimOutput === false, "Demo audit must not mutate AIM output.");
assert(demoA.mayMutateJournal === false, "Demo audit must not mutate journal.");
assert(demoA.mayCreateTruth === false, "Demo audit must not create truth.");
assert(demoA.mayGovern === false, "Demo audit must not govern.");
assert(demoA.mayApproveDecision === false, "Demo audit must not approve decisions.");
assert(demoA.mayExecuteTrade === false, "Demo audit must not execute trades.");
assert(demoA.mayProvideFinancialAdvice === false, "Demo audit must not provide financial advice.");
assert(demoA.mayUseLiveData === false, "Demo audit must not use live data.");
assert(demoA.mayCallExternalApi === false, "Demo audit must not call external APIs.");
assert(demoA.humanReviewRequired === true, "Demo audit must require human review.");
assert(demoA.finalAuthority === "Human", "Human authority must remain final.");
assert(demoA.finalAction === "", "Demo audit final action must remain blank.");
assert(Object.isFrozen(demoA), "Demo audit packet must be frozen.");
assert(Object.isFrozen(demoA.sections), "Demo audit sections must be frozen.");

for (const [check, passed] of Object.entries(governance.checks)) {
  assert(passed === true, "Demo audit governance check failed: " + check);
}

assert(governance.status === "DEMO_AUDIT_GOVERNANCE_VERIFIED", "Demo audit governance must verify.");
assert(governance.refusalReasons.length === 0, "Demo audit governance should have no refusal reasons.");

const heldDraft = {
  ...validDraft,
  draftId: "draft_demo_held_001",
  evidenceStrength: "Moderate" as const
};

const heldFlow = buildAimOperatorEndToEndLocalFlow(heldDraft);
const heldRecord = buildAimLocalRecordPacket(heldFlow);
const heldWatchlist = buildAimWatchlistThesisItem(heldRecord, 0);
const heldReview = buildAimHumanReviewOutcomePacket(
  heldRecord,
  "HUMAN_DEFERRED",
  "INSUFFICIENT_DATA",
  "Human deferred review pending stronger evidence.",
  "Held signals should not increase confidence.",
  "Require more confirmation before thesis escalation.",
  ""
);
const heldFeedback = buildAimFeedbackSummaryPacket([heldRecord], [heldWatchlist], [heldReview]);
const heldProductReadiness = buildAimProductReadinessAuditPacket({
  flow: heldFlow,
  localRecord: heldRecord,
  watchlistItem: heldWatchlist,
  humanReviews: [heldReview],
  feedbackSummary: heldFeedback
});
const heldShell = buildAimShellAdapterPacket({ flow: heldFlow, localRecord: heldRecord, watchlistItem: heldWatchlist, feedbackSummary: heldFeedback });
const heldIntakeUi = buildAimManualIntakeUiPacket(heldDraft);
const heldViewer = buildAimPreviewRecordViewerPacket({ flow: heldFlow, localRecord: heldRecord, shellAdapter: heldShell });
const heldReviewView = buildAimWatchlistReviewViewPacket({
  watchlistItem: heldWatchlist,
  localRecord: heldRecord,
  reviewOutcome: heldReview,
  viewerPacket: heldViewer
});
const heldDemo = buildAimV02FeedbackDemoAuditPacket({
  productReadiness: heldProductReadiness,
  feedbackSummary: heldFeedback,
  shellAdapter: heldShell,
  intakeUi: heldIntakeUi,
  previewRecordViewer: heldViewer,
  watchlistReviewView: heldReviewView
});
const heldGovernance = verifyAimV02FeedbackDemoAuditGovernance(heldDemo);

assert(heldDemo.status === "AIM_V0_2_DEMO_HELD", "Held chain should create held demo audit.");
assert(heldDemo.mayApproveDecision === false, "Held demo must not approve decision.");
assert(heldDemo.finalAction === "", "Held demo final action must remain blank.");
assert(heldGovernance.status === "DEMO_AUDIT_GOVERNANCE_VERIFIED", "Held demo governance must verify.");

const refusedDraft = {
  ...validDraft,
  draftId: "draft_demo_refused_001",
  proposedAction: "Buy now and execute trade immediately."
};

const refusedFlow = buildAimOperatorEndToEndLocalFlow(refusedDraft);
const refusedRecord = buildAimLocalRecordPacket(refusedFlow);
const refusedWatchlist = buildAimWatchlistThesisItem(refusedRecord, 0);
const refusedReview = buildAimHumanReviewOutcomePacket(
  refusedRecord,
  "HUMAN_REJECTED_THESIS",
  "CONTRADICTION_CONFIRMED",
  "Human rejected the thesis due to prohibited action language.",
  "Prohibited execution language must remain blocked.",
  "Keep refusal surfaced without creating downstream action.",
  "Execution language confirmed."
);
const refusedFeedback = buildAimFeedbackSummaryPacket([refusedRecord], [refusedWatchlist], [refusedReview]);
const refusedProductReadiness = buildAimProductReadinessAuditPacket({
  flow: refusedFlow,
  localRecord: refusedRecord,
  watchlistItem: refusedWatchlist,
  humanReviews: [refusedReview],
  feedbackSummary: refusedFeedback
});
const refusedShell = buildAimShellAdapterPacket({ flow: refusedFlow, localRecord: refusedRecord, watchlistItem: refusedWatchlist, feedbackSummary: refusedFeedback });
const refusedIntakeUi = buildAimManualIntakeUiPacket(refusedDraft);
const refusedViewer = buildAimPreviewRecordViewerPacket({ flow: refusedFlow, localRecord: refusedRecord, shellAdapter: refusedShell });
const refusedReviewView = buildAimWatchlistReviewViewPacket({
  watchlistItem: refusedWatchlist,
  localRecord: refusedRecord,
  reviewOutcome: refusedReview,
  viewerPacket: refusedViewer
});
const refusedDemo = buildAimV02FeedbackDemoAuditPacket({
  productReadiness: refusedProductReadiness,
  feedbackSummary: refusedFeedback,
  shellAdapter: refusedShell,
  intakeUi: refusedIntakeUi,
  previewRecordViewer: refusedViewer,
  watchlistReviewView: refusedReviewView
});
const refusedGovernance = verifyAimV02FeedbackDemoAuditGovernance(refusedDemo);

assert(refusedDemo.status === "AIM_V0_2_DEMO_REFUSED", "Refused chain should create refused demo audit.");
assert(refusedDemo.mayExecuteTrade === false, "Refused demo must not execute trade.");
assert(refusedDemo.finalAction === "", "Refused demo final action must remain blank.");
assert(refusedGovernance.status === "DEMO_AUDIT_GOVERNANCE_VERIFIED", "Refused demo governance must verify.");

console.log("AIM_V02_FEEDBACK_DEMO_AUDIT_SPRINT5_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "feedback demo audit packet created",
      "demo audit hash deterministic",
      "AIM product name preserved",
      "v0.2 demo audit version locked",
      "product readiness visible",
      "feedback summary visible",
      "shell connection visible",
      "manual intake UI visible",
      "preview record viewer visible",
      "watchlist review visible",
      "learning loop visible",
      "authority boundary visible",
      "HTML preview created",
      "ready demo audit works",
      "held demo audit works",
      "refused demo audit works",
      "demo audit governance verifies",
      "demo audit packet frozen",
      "demo audit sections frozen",
      "no feedback mutation",
      "no audit mutation",
      "no demo mutation",
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
    demoStatus: demoA.status,
    heldDemoStatus: heldDemo.status,
    refusedDemoStatus: refusedDemo.status,
    readinessScore: demoA.readinessScore,
    demoCompletenessScore: demoA.demoCompletenessScore,
    demoHash: demoA.demoHash
  },
  null,
  2
));