import {
  AIM_PAI_SAFE_DECISION_STATUS,
  buildAimDecisionItem,
  buildAimFeedbackLoopInput,
  buildAimJournalPacket,
  buildAimJournalPackets,
  summarizeAimJournalPackets,
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
const safeJournal = buildAimJournalPacket(safeDecision);

assert(safeDecision.paiSafeStatus === AIM_PAI_SAFE_DECISION_STATUS.SAFE_TO_REVIEW, "Base decision must be SAFE TO REVIEW.");
assert(safeJournal.status === "JOURNAL_READY", "SAFE TO REVIEW decision should create JOURNAL_READY packet.");
assert(safeJournal.decisionSnapshot.decisionId === safeDecision.decisionId, "Journal must preserve decision ID.");
assert(safeJournal.rationaleSnapshot.sourceInputs.length === 2, "Journal must preserve source inputs.");
assert(safeJournal.rationaleSnapshot.readinessReasons.length > 0, "Journal must preserve readiness reasons.");
assert(safeJournal.reviewOutcomePlaceholder.reviewOutcome === "PENDING_HUMAN_REVIEW", "Review outcome must remain pending.");
assert(safeJournal.reviewOutcomePlaceholder.finalAction === "", "Review placeholder final action must remain blank.");
assert(safeJournal.feedbackLoopInput.resultClassification === "PENDING_RESULT", "Feedback must begin pending.");
assert(safeJournal.feedbackLoopInput.finalAction === "", "Feedback final action must remain blank.");
assert(safeJournal.preservationRequired === true, "Journal preservation must be required.");
assert(safeJournal.humanReviewRequired === true, "Human review must remain required.");
assert(safeJournal.finalAuthority === "Human", "Human final authority must remain locked.");
assert(safeJournal.executionAuthorized === false, "Journal must not authorize execution.");
assert(safeJournal.tradeRecommendation === null, "Journal must not create trade recommendation.");
assert(safeJournal.financialAdviceProvided === false, "Journal must not provide financial advice.");
assert(safeJournal.finalAction === "", "Journal final action must remain blank.");
assert(Object.isFrozen(safeJournal), "Journal packet must be frozen.");
assert(Object.isFrozen(safeJournal.feedbackLoopInput), "Feedback loop input must be frozen.");

const weakDecision = buildAimDecisionItem({
  ...baseInput,
  sourceInputs: ["single_unconfirmed_source"],
  evidenceStrength: "Weak"
});
const weakJournal = buildAimJournalPacket(weakDecision);
assert(weakDecision.paiSafeStatus === AIM_PAI_SAFE_DECISION_STATUS.REFUSED_INSUFFICIENT_SIGNAL, "Weak decision must refuse insufficient signal.");
assert(weakJournal.status === "JOURNAL_ARCHIVED_FOR_REVIEW", "Refused decision should archive for review.");

const holdDecision = buildAimDecisionItem({
  ...baseInput,
  evidenceStrength: "Moderate"
});
const holdJournal = buildAimJournalPacket(holdDecision);
assert(holdDecision.paiSafeStatus === AIM_PAI_SAFE_DECISION_STATUS.HOLD_FOR_CONFIRMATION, "Moderate decision must hold.");
assert(holdJournal.status === "JOURNAL_HELD", "Held decision should create JOURNAL_HELD packet.");

const contradictionDecision = buildAimDecisionItem({
  ...baseInput,
  contradictionFlags: ["New source contradicts timing thesis."],
  evidenceStrength: "Contradicted"
});
const contradictionJournal = buildAimJournalPacket(contradictionDecision);
assert(contradictionDecision.paiSafeStatus === AIM_PAI_SAFE_DECISION_STATUS.REFUSED_THESIS_CONTRADICTION, "Contradiction must refuse thesis.");
assert(contradictionJournal.status === "JOURNAL_ARCHIVED_FOR_REVIEW", "Contradiction should preserve journal.");

const updatedFeedback = buildAimFeedbackLoopInput(
  safeDecision,
  safeJournal.journalPacketId,
  "2026-05-14T12:10:00.000Z",
  "THESIS_STRENGTHENED",
  "Strong evidence improved review clarity.",
  "Require two-source confirmation before future review escalation.",
  "",
  "Compare outcome against thesis after human review."
);

assert(updatedFeedback.resultClassification === "THESIS_STRENGTHENED", "Feedback should accept result classification.");
assert(updatedFeedback.lessonLearned.length > 0, "Feedback should preserve lesson learned.");
assert(updatedFeedback.decisionImprovementNote.length > 0, "Feedback should preserve improvement note.");
assert(updatedFeedback.mayExecuteTrade === false, "Feedback must not execute trade.");
assert(updatedFeedback.mayApproveInvestment === false, "Feedback must not approve investment.");
assert(updatedFeedback.mayProvideFinancialAdvice === false, "Feedback must not provide financial advice.");
assert(updatedFeedback.finalAction === "", "Feedback final action must remain blank.");
assert(updatedFeedback.humanReviewRequired === true, "Feedback must require human review.");
assert(Object.isFrozen(updatedFeedback), "Updated feedback input must be frozen.");

const packets = buildAimJournalPackets([safeDecision, weakDecision, holdDecision, contradictionDecision]);
const summary = summarizeAimJournalPackets(packets);

assert(summary.JOURNAL_READY === 1, "Summary should contain one JOURNAL_READY packet.");
assert(summary.JOURNAL_HELD === 1, "Summary should contain one JOURNAL_HELD packet.");
assert(summary.JOURNAL_ARCHIVED_FOR_REVIEW === 2, "Summary should contain two archived review packets.");
assert(summary.JOURNAL_REFUSED_INPUT === 0, "Summary should contain zero refused input packets.");

for (const packet of packets) {
  assert(packet.humanReviewRequired === true, "Every journal packet requires human review.");
  assert(packet.preservationRequired === true, "Every journal packet requires preservation.");
  assert(packet.finalAuthority === "Human", "Every journal packet preserves human authority.");
  assert(packet.executionAuthorized === false, "No journal packet may authorize execution.");
  assert(packet.tradeRecommendation === null, "No journal packet may recommend trade.");
  assert(packet.financialAdviceProvided === false, "No journal packet may provide financial advice.");
  assert(packet.finalAction === "", "No journal packet may auto-complete final action.");
  assert(packet.feedbackLoopInput.mayExecuteTrade === false, "No feedback loop may execute trade.");
  assert(packet.feedbackLoopInput.mayApproveInvestment === false, "No feedback loop may approve investment.");
  assert(packet.feedbackLoopInput.mayProvideFinancialAdvice === false, "No feedback loop may provide financial advice.");
}

console.log("AIM_PASS_4_JOURNAL_FEEDBACK_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "journal packet created from SAFE TO REVIEW decision",
      "decision snapshot preserved",
      "rationale snapshot preserved",
      "review outcome placeholder remains blank",
      "feedback loop input created",
      "feedback preserves learning without action",
      "refused decision archived for review",
      "held decision creates JOURNAL_HELD packet",
      "contradiction journal preserved",
      "journal packets frozen",
      "feedback inputs frozen",
      "no execution authorized",
      "no trade recommendation created",
      "no financial advice provided",
      "final action remains blank",
      "human authority remains final"
    ],
    summary
  },
  null,
  2
));