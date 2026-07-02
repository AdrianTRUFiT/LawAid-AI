import {
  buildAimFeedbackSummaryPacket,
  buildAimHumanReviewOutcomePacket,
  buildAimLocalRecordPacket,
  buildAimOperatorEndToEndLocalFlow,
  buildAimPreviewRecordViewerPacket,
  buildAimShellAdapterPacket,
  buildAimWatchlistReviewViewPacket,
  buildAimWatchlistThesisItem,
  verifyAimWatchlistReviewGovernance
} from "../src/index.js";
import { validDraft } from "./aim-test-draft.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const flow = buildAimOperatorEndToEndLocalFlow(validDraft);
const localRecord = buildAimLocalRecordPacket(flow);
const watchlistItem = buildAimWatchlistThesisItem(localRecord, 2);

const review = buildAimHumanReviewOutcomePacket(
  localRecord,
  "HUMAN_CONFIRMED_LEARNING",
  "THESIS_STRENGTHENED",
  "Human confirmed this as a learning artifact.",
  "Watchlist continuity improves when each thesis is reviewed against a preserved local record.",
  "Keep review surfaces read-only and require human comparison before confidence increases.",
  ""
);

const feedbackSummary = buildAimFeedbackSummaryPacket([localRecord], [watchlistItem], [review]);
const shellAdapter = buildAimShellAdapterPacket({ flow, localRecord, watchlistItem, feedbackSummary });
const viewerPacket = buildAimPreviewRecordViewerPacket({ flow, localRecord, shellAdapter });

const viewA = buildAimWatchlistReviewViewPacket({
  watchlistItem,
  localRecord,
  reviewOutcome: review,
  viewerPacket
});

const viewB = buildAimWatchlistReviewViewPacket({
  watchlistItem,
  localRecord,
  reviewOutcome: review,
  viewerPacket
});

const governance = verifyAimWatchlistReviewGovernance(viewA);

assert(viewA.viewHash === viewB.viewHash, "Watchlist review view hash must be deterministic.");
assert(viewA.status === "WATCHLIST_REVIEW_READY", "Active watchlist should create ready review view.");
assert(viewA.title === "AIM Watchlist + Human Review View", "Review view title must be locked.");
assert(viewA.sourceWatchlistId === watchlistItem.watchlistId, "View must preserve watchlist ID.");
assert(viewA.sourceRecordId === localRecord.recordId, "View must preserve record ID.");
assert(viewA.sourceReviewId === review.reviewId, "View must preserve review ID.");
assert(viewA.sourceDecisionId === localRecord.decisionId, "View must preserve decision ID.");
assert(viewA.sourceViewerId === viewerPacket.viewerId, "View must preserve viewer ID.");
assert(viewA.sectionCount === 9, "Review view must expose nine sections.");
assert(viewA.sections.length === 9, "Review view section count must match.");

const byKind = new Map(viewA.sections.map((section) => [section.kind, section]));

assert(byKind.has("watchlist_status"), "Watchlist status section required.");
assert(byKind.has("thesis_continuity"), "Thesis continuity section required.");
assert(byKind.has("latest_record"), "Latest record section required.");
assert(byKind.has("human_review_outcome"), "Human review outcome section required.");
assert(byKind.has("lesson_learned"), "Lesson learned section required.");
assert(byKind.has("decision_improvement"), "Decision improvement section required.");
assert(byKind.has("contradiction_update"), "Contradiction update section required.");
assert(byKind.has("next_review_prompt"), "Next review prompt section required.");
assert(byKind.has("authority_boundary"), "Authority boundary section required.");

assert(byKind.get("watchlist_status")?.displayFields.watchlistId === watchlistItem.watchlistId, "Watchlist section must preserve watchlist ID.");
assert(byKind.get("thesis_continuity")?.displayFields.thesisReference === watchlistItem.thesisReference, "Thesis section must preserve thesis reference.");
assert(byKind.get("latest_record")?.displayFields.recordId === localRecord.recordId, "Latest record section must preserve record ID.");
assert(byKind.get("human_review_outcome")?.displayFields.reviewId === review.reviewId, "Review outcome section must preserve review ID.");
assert(byKind.get("lesson_learned")?.displayFields.lessonLearned === review.lessonLearned, "Lesson learned section must preserve lesson.");
assert(byKind.get("decision_improvement")?.displayFields.decisionImprovementNote === review.decisionImprovementNote, "Decision improvement section must preserve improvement note.");
assert(byKind.get("next_review_prompt")?.displayFields.nextReviewPrompt === review.nextReviewPrompt, "Next review prompt must be visible.");
assert(byKind.get("authority_boundary")?.displayFields.finalAuthority === "Human", "Authority boundary must preserve human authority.");
assert(byKind.get("authority_boundary")?.displayFields.actionBoundary === "View and record review only. No approval, advice, or execution authority.", "Authority boundary must prevent execution authority.");

assert(viewA.htmlPreview.includes("AIM Watchlist + Human Review View"), "HTML preview must show review view title.");
assert(viewA.htmlPreview.includes("data-aim-watchlist-review-view=\"true\""), "HTML preview must include watchlist review root.");
assert(viewA.htmlPreview.includes("Human review is preserved, not automated"), "HTML preview must show human review boundary language.");

assert(viewA.readOnly === true, "Review view must be read-only.");
assert(viewA.deterministic === true, "Review view must be deterministic.");
assert(viewA.controlledVisibilityOnly === true, "Review view must be controlled visibility only.");
assert(viewA.localOnly === true, "Review view must be local-only.");
assert(viewA.mayMutateWatchlist === false, "Review view must not mutate watchlist.");
assert(viewA.mayMutateReview === false, "Review view must not mutate human review.");
assert(viewA.mayMutateRecord === false, "Review view must not mutate record.");
assert(viewA.mayMutateJournal === false, "Review view must not mutate journal.");
assert(viewA.mayMutateAimOutput === false, "Review view must not mutate AIM output.");
assert(viewA.mayCreateTruth === false, "Review view must not create truth.");
assert(viewA.mayGovern === false, "Review view must not govern.");
assert(viewA.mayApproveDecision === false, "Review view must not approve decision.");
assert(viewA.mayExecuteTrade === false, "Review view must not execute trade.");
assert(viewA.mayProvideFinancialAdvice === false, "Review view must not provide financial advice.");
assert(viewA.mayUseLiveData === false, "Review view must not use live data.");
assert(viewA.mayCallExternalApi === false, "Review view must not call external API.");
assert(viewA.humanReviewRequired === true, "Review view must require human review.");
assert(viewA.finalAuthority === "Human", "Human authority must remain final.");
assert(viewA.finalAction === "", "Review view final action must remain blank.");
assert(Object.isFrozen(viewA), "Review view packet must be frozen.");
assert(Object.isFrozen(viewA.sections), "Review view sections must be frozen.");

for (const [check, passed] of Object.entries(governance.checks)) {
  assert(passed === true, "Watchlist review governance check failed: " + check);
}

assert(governance.status === "WATCHLIST_REVIEW_GOVERNANCE_VERIFIED", "Watchlist review governance must verify.");
assert(governance.refusalReasons.length === 0, "Watchlist review governance should have no refusal reasons.");

const heldFlow = buildAimOperatorEndToEndLocalFlow({
  ...validDraft,
  draftId: "draft_review_held_001",
  evidenceStrength: "Moderate"
});

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
const heldView = buildAimWatchlistReviewViewPacket({
  watchlistItem: heldWatchlist,
  localRecord: heldRecord,
  reviewOutcome: heldReview
});
const heldGovernance = verifyAimWatchlistReviewGovernance(heldView);

assert(heldView.status === "WATCHLIST_REVIEW_HELD", "Held watchlist should create held review view.");
assert(heldView.mayApproveDecision === false, "Held review view must not approve decision.");
assert(heldView.finalAction === "", "Held review final action must remain blank.");
assert(heldGovernance.status === "WATCHLIST_REVIEW_GOVERNANCE_VERIFIED", "Held review governance must verify.");

const refusedFlow = buildAimOperatorEndToEndLocalFlow({
  ...validDraft,
  draftId: "draft_review_refused_001",
  proposedAction: "Buy now and execute trade immediately."
});

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
const refusedView = buildAimWatchlistReviewViewPacket({
  watchlistItem: refusedWatchlist,
  localRecord: refusedRecord,
  reviewOutcome: refusedReview
});
const refusedGovernance = verifyAimWatchlistReviewGovernance(refusedView);

assert(refusedView.status === "WATCHLIST_REVIEW_REFUSED", "Refused local record should create refused review view.");
assert(refusedView.sourceDecisionId === "", "Refused review must not invent decision ID.");
assert(refusedView.mayExecuteTrade === false, "Refused review must not execute trade.");
assert(refusedView.finalAction === "", "Refused review final action must remain blank.");
assert(refusedGovernance.status === "WATCHLIST_REVIEW_GOVERNANCE_VERIFIED", "Refused review governance must verify.");

assert(watchlistItem.watchlistId === viewA.sourceWatchlistId, "Review view must not mutate watchlist ID.");
assert(localRecord.recordId === viewA.sourceRecordId, "Review view must not mutate record ID.");
assert(review.reviewId === viewA.sourceReviewId, "Review view must not mutate review ID.");

console.log("AIM_V02_WATCHLIST_HUMAN_REVIEW_SPRINT4_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "watchlist review view packet created",
      "review view hash deterministic",
      "watchlist status visible",
      "thesis continuity visible",
      "latest record visible",
      "human review outcome visible",
      "lesson learned visible",
      "decision improvement visible",
      "contradiction update visible",
      "next review prompt visible",
      "authority boundary visible",
      "HTML preview created",
      "ready review view works",
      "held review view works",
      "refused review view works",
      "review governance verifies",
      "review view packet frozen",
      "review sections frozen",
      "no watchlist mutation",
      "no review mutation",
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
    viewStatus: viewA.status,
    heldViewStatus: heldView.status,
    refusedViewStatus: refusedView.status,
    viewHash: viewA.viewHash
  },
  null,
  2
));