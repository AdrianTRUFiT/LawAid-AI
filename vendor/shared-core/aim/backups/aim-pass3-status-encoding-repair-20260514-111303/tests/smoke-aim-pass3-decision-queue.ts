import {
  buildAimDecisionItem,
  buildAimDecisionQueue,
  summarizeAimDecisionQueue,
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

const validDecision = buildAimDecisionItem(baseInput);

assert(validDecision.decisionId.length > 0, "Decision ID must exist.");
assert(validDecision.paiSafeStatus === "SAFE TO REVIEW", "Strong documented decision should be SAFE TO REVIEW.");
assert(validDecision.humanReviewRequired === true, "Human review must remain required.");
assert(validDecision.journalRequired === true, "Journal must be required.");
assert(validDecision.finalAuthority === "Human", "Human authority must remain final.");
assert(validDecision.paiSafeReviewPacket.mayApproveInvestment === false, "PAI-SAFE must not approve investments.");
assert(validDecision.paiSafeReviewPacket.mayExecuteTrade === false, "PAI-SAFE must not execute trades.");
assert(validDecision.paiSafeReviewPacket.mayProvideFinancialAdvice === false, "PAI-SAFE must not provide financial advice.");

const weakDecision = buildAimDecisionItem({
  ...baseInput,
  sourceInputs: ["single_unconfirmed_source"],
  evidenceStrength: "Weak"
});

assert(weakDecision.paiSafeStatus === "REFUSED â€” INSUFFICIENT SIGNAL", "Weak evidence should refuse for insufficient signal.");

const contradictionDecision = buildAimDecisionItem({
  ...baseInput,
  contradictionFlags: ["Source B contradicts thesis timing."],
  evidenceStrength: "Contradicted"
});

assert(contradictionDecision.paiSafeStatus === "REFUSED â€” THESIS CONTRADICTION", "Contradiction should refuse thesis.");

const highRiskDecision = buildAimDecisionItem({
  ...baseInput,
  riskClass: "Excessive"
});

assert(highRiskDecision.paiSafeStatus === "REFUSED â€” RISK TOO HIGH", "Excessive risk should refuse.");

const undocumentedDecision = buildAimDecisionItem({
  ...baseInput,
  sourceInputs: [],
  documentationRefs: [],
  evidenceSummary: "",
  thesisReference: ""
});

assert(undocumentedDecision.paiSafeStatus === "REFUSED â€” UNDOCUMENTED ACTION", "Undocumented decision should refuse.");
assert(undocumentedDecision.paiSafeReviewPacket.readyForHumanReview === false, "Undocumented decision must not be review ready.");

const prohibitedTradeDecision = buildAimDecisionItem({
  ...baseInput,
  proposedAction: "Buy now and execute trade immediately."
});

assert(prohibitedTradeDecision.prohibitedActionFlag === true, "Prohibited action language must be flagged.");
assert(prohibitedTradeDecision.paiSafeStatus === "REFUSED â€” UNDOCUMENTED ACTION", "Prohibited action language must be refused.");
assert(prohibitedTradeDecision.paiSafeReviewPacket.mayExecuteTrade === false, "Trade execution must remain false.");

const holdDecision = buildAimDecisionItem({
  ...baseInput,
  evidenceStrength: "Moderate"
});

assert(holdDecision.paiSafeStatus === "HOLD FOR CONFIRMATION", "Moderate evidence should hold for confirmation.");

const queue = buildAimDecisionQueue([
  baseInput,
  { ...baseInput, evidenceStrength: "Weak", sourceInputs: ["single_unconfirmed_source"] },
  { ...baseInput, contradictionFlags: ["Contradiction present."], evidenceStrength: "Contradicted" },
  { ...baseInput, riskClass: "Excessive" },
  { ...baseInput, sourceInputs: [], documentationRefs: [], evidenceSummary: "", thesisReference: "" }
]);

const summary = summarizeAimDecisionQueue(queue);

assert(summary["SAFE TO REVIEW"] === 1, "Queue summary should contain one SAFE TO REVIEW.");
assert(summary["REFUSED â€” INSUFFICIENT SIGNAL"] === 1, "Queue summary should contain one insufficient signal refusal.");
assert(summary["REFUSED â€” THESIS CONTRADICTION"] === 1, "Queue summary should contain one thesis contradiction refusal.");
assert(summary["REFUSED â€” RISK TOO HIGH"] === 1, "Queue summary should contain one risk refusal.");
assert(summary["REFUSED â€” UNDOCUMENTED ACTION"] === 1, "Queue summary should contain one undocumented action refusal.");

for (const decision of queue) {
  assert(decision.humanReviewRequired === true, "Every decision requires human review.");
  assert(decision.journalRequired === true, "Every decision requires journal preservation.");
  assert(decision.finalAuthority === "Human", "Every decision preserves human final authority.");
  assert(decision.paiSafeReviewPacket.mayApproveInvestment === false, "No decision may approve investment.");
  assert(decision.paiSafeReviewPacket.mayExecuteTrade === false, "No decision may execute trade.");
  assert(decision.paiSafeReviewPacket.mayProvideFinancialAdvice === false, "No decision may provide financial advice.");
}

console.log("AIM_PASS_3_DECISION_QUEUE_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "valid decision item created",
      "strong evidence returns SAFE TO REVIEW",
      "weak evidence returns REFUSED â€” INSUFFICIENT SIGNAL",
      "contradiction returns REFUSED â€” THESIS CONTRADICTION",
      "excessive risk returns REFUSED â€” RISK TOO HIGH",
      "undocumented action returns REFUSED â€” UNDOCUMENTED ACTION",
      "prohibited trade language flagged and refused",
      "PAI-SAFE review contract does not approve investments",
      "PAI-SAFE review contract does not execute trades",
      "PAI-SAFE review contract does not provide financial advice",
      "human authority remains final",
      "journal required for every decision"
    ],
    summary
  },
  null,
  2
));