import {
  buildAimFeedbackSummaryPacket,
  buildAimHumanReviewOutcomePacket,
  buildAimLocalRecordPacket,
  buildAimOperatorEndToEndLocalFlow,
  buildAimWatchlistThesisItem,
  type AimManualEvidenceDraft
} from "../src/index.js";
import { validDraft } from "./aim-test-draft.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const flow = buildAimOperatorEndToEndLocalFlow(validDraft as AimManualEvidenceDraft);
const record = buildAimLocalRecordPacket(flow);
const watchlist = buildAimWatchlistThesisItem(record, 2);

const reviewA = buildAimHumanReviewOutcomePacket(
  record,
  "HUMAN_CONFIRMED_LEARNING",
  "THESIS_STRENGTHENED",
  "Human confirmed this as a learning artifact.",
  "Strong evidence improves review clarity.",
  "Keep requiring source confirmation before review escalation.",
  ""
);

const reviewB = buildAimHumanReviewOutcomePacket(
  record,
  "HUMAN_REVIEWED_NO_ACTION",
  "RISK_REDUCED",
  "Human reviewed and took no action.",
  "Risk reduced after contradiction check.",
  "Separate market excitement from documented dependency.",
  ""
);

const summary = buildAimFeedbackSummaryPacket([record], [watchlist], [reviewA, reviewB]);
const summaryB = buildAimFeedbackSummaryPacket([record], [watchlist], [reviewA, reviewB]);

assert(summary.summaryId === summaryB.summaryId, "Feedback summary ID must be deterministic.");
assert(summary.recordCount === 1, "Feedback summary must preserve record count.");
assert(summary.reviewCount === 2, "Feedback summary must preserve review count.");
assert(summary.watchlistCount === 1, "Feedback summary must preserve watchlist count.");
assert(summary.trend === "RISK_REDUCING", "Risk reduced review should produce risk reducing trend.");
assert(summary.resultClassificationCounts.THESIS_STRENGTHENED === 1, "Summary should count strengthened thesis.");
assert(summary.resultClassificationCounts.RISK_REDUCED === 1, "Summary should count reduced risk.");
assert(summary.latestLessons.length === 2, "Summary should preserve latest lessons.");
assert(summary.improvementPrompts.length === 2, "Summary should preserve improvement prompts.");
assert(summary.readOnly === true, "Feedback summary must be read-only.");
assert(summary.deterministic === true, "Feedback summary must be deterministic.");
assert(summary.localOnly === true, "Feedback summary must be local-only.");
assert(summary.mayExecuteTrade === false, "Feedback summary must not execute trade.");
assert(summary.mayApproveInvestment === false, "Feedback summary must not approve investment.");
assert(summary.mayProvideFinancialAdvice === false, "Feedback summary must not provide financial advice.");
assert(summary.mayWriteSoul === false, "Feedback summary must not write S:\\SOUL.");
assert(summary.finalAuthority === "Human", "Human authority must remain final.");
assert(summary.finalAction === "", "Feedback summary final action must remain blank.");
assert(Object.isFrozen(summary), "Feedback summary packet must be frozen.");

const insufficient = buildAimFeedbackSummaryPacket([record], [watchlist], [reviewA]);
assert(insufficient.trend === "INSUFFICIENT_HISTORY", "Single review should be insufficient history.");

console.log("AIM_PASS_14_FEEDBACK_SUMMARY_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "feedback summary created",
      "summary deterministic",
      "record count preserved",
      "review count preserved",
      "watchlist count preserved",
      "result classification counts created",
      "latest lessons preserved",
      "improvement prompts preserved",
      "risk reducing trend detected",
      "insufficient history trend detected",
      "summary read-only",
      "summary frozen",
      "no trade execution",
      "no investment approval",
      "no financial advice",
      "no S:\\SOUL write",
      "final action remains blank",
      "human authority remains final"
    ],
    trend: summary.trend,
    insufficientTrend: insufficient.trend
  },
  null,
  2
));