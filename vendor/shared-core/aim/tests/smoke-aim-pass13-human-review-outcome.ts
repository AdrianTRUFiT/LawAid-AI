import {
  buildAimHumanReviewOutcomePacket,
  buildAimLocalRecordPacket,
  buildAimOperatorEndToEndLocalFlow,
  type AimManualEvidenceDraft
} from "../src/index.js";
import { validDraft } from "./aim-test-draft.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const flow = buildAimOperatorEndToEndLocalFlow(validDraft as AimManualEvidenceDraft);
const record = buildAimLocalRecordPacket(flow);

const review = buildAimHumanReviewOutcomePacket(
  record,
  "HUMAN_CONFIRMED_LEARNING",
  "THESIS_STRENGTHENED",
  "Human reviewed the packet and confirmed this remains a learning artifact.",
  "Evidence quality improved when multiple sources were required.",
  "Keep requiring documented source confirmation before readiness escalation.",
  ""
);

assert(review.reviewer === "Human", "Reviewer must be Human.");
assert(review.sourceRecordId === record.recordId, "Review must point to source record.");
assert(review.sourceDecisionId === record.decisionId, "Review must point to source decision.");
assert(review.reviewDecision === "HUMAN_CONFIRMED_LEARNING", "Review decision must be preserved.");
assert(review.resultClassification === "THESIS_STRENGTHENED", "Result classification must be preserved.");
assert(review.humanDecisionNote.length > 0, "Human decision note must be preserved.");
assert(review.lessonLearned.length > 0, "Lesson learned must be preserved.");
assert(review.decisionImprovementNote.length > 0, "Improvement note must be preserved.");
assert(review.nextReviewPrompt.length > 0, "Next review prompt must be created.");
assert(review.readOnly === true, "Review outcome must be read-only.");
assert(review.localOnly === true, "Review outcome must be local-only.");
assert(review.mayExecuteTrade === false, "Review outcome must not execute trade.");
assert(review.mayApproveInvestment === false, "Review outcome must not approve investment.");
assert(review.mayProvideFinancialAdvice === false, "Review outcome must not provide financial advice.");
assert(review.mayWriteSoul === false, "Review outcome must not write S:\\SOUL.");
assert(review.finalAuthority === "Human", "Human authority must remain final.");
assert(review.finalAction === "", "Review final action must remain blank.");
assert(Object.isFrozen(review), "Review outcome packet must be frozen.");

console.log("AIM_PASS_13_HUMAN_REVIEW_OUTCOME_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "human review outcome created",
      "review points to local record",
      "review points to decision",
      "human decision preserved",
      "result classification preserved",
      "lesson learned preserved",
      "decision improvement note preserved",
      "next review prompt created",
      "review read-only",
      "review frozen",
      "no trade execution",
      "no investment approval",
      "no financial advice",
      "no S:\\SOUL write",
      "final action remains blank",
      "human authority remains final"
    ],
    reviewDecision: review.reviewDecision,
    resultClassification: review.resultClassification
  },
  null,
  2
));