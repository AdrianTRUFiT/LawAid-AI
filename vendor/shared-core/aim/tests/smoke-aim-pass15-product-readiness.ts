import {
  buildAimFeedbackSummaryPacket,
  buildAimHumanReviewOutcomePacket,
  buildAimLocalRecordPacket,
  buildAimOperatorEndToEndLocalFlow,
  buildAimProductReadinessAuditPacket,
  buildAimWatchlistThesisItem
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

const auditA = buildAimProductReadinessAuditPacket({
  flow,
  localRecord,
  watchlistItem,
  humanReviews: [reviewA, reviewB],
  feedbackSummary
});

const auditB = buildAimProductReadinessAuditPacket({
  flow,
  localRecord,
  watchlistItem,
  humanReviews: [reviewA, reviewB],
  feedbackSummary
});

assert(auditA.auditId === auditB.auditId, "Readiness audit ID must be deterministic.");
assert(auditA.product === "AIM — AI MarketIntel", "Product name must remain AIM — AI MarketIntel.");
assert(auditA.version === "v0.1-local", "Product readiness version must be v0.1-local.");
assert(auditA.status === "AIM_V0_1_LOCAL_READY", "AIM v0.1 local product should be ready.");
assert(auditA.localWorkingProduct === true, "Audit should confirm local working product.");
assert(auditA.readinessScore === 100, "Readiness score should be 100.");
assert(auditA.passedCheckCount === auditA.totalCheckCount, "All checks must pass.");
assert(auditA.refusalReasons.length === 0, "Ready audit should have no refusal reasons.");
assert(auditA.gates.length === 5, "Five readiness gates expected.");
assert(auditA.gates.every((gate) => gate.passed === true), "All readiness gates must pass.");

assert(auditA.checks.manualIntakeVerified === true, "Manual intake must be verified.");
assert(auditA.checks.decisionQueueVerified === true, "Decision queue must be verified.");
assert(auditA.checks.paiSafeReviewVerified === true, "PAI-SAFE review must be verified.");
assert(auditA.checks.journalVerified === true, "Journal must be verified.");
assert(auditA.checks.fixtureExportVerified === true, "Fixture export must be verified.");
assert(auditA.checks.previewHarnessVerified === true, "Preview harness must be verified.");
assert(auditA.checks.staticRenderVerified === true, "Static render must be verified.");
assert(auditA.checks.browserVerificationVerified === true, "Browser verification must be verified.");
assert(auditA.checks.localRecordVerified === true, "Local record must be verified.");
assert(auditA.checks.watchlistVerified === true, "Watchlist must be verified.");
assert(auditA.checks.humanReviewVerified === true, "Human review must be verified.");
assert(auditA.checks.feedbackSummaryVerified === true, "Feedback summary must be verified.");

assert(auditA.checks.readOnlyIntegrityVerified === true, "Read-only integrity must be verified.");
assert(auditA.checks.localOnlyVerified === true, "Local-only behavior must be verified.");
assert(auditA.checks.humanAuthorityVerified === true, "Human authority must be verified.");
assert(auditA.checks.noLiveDataVerified === true, "No live data must be verified.");
assert(auditA.checks.noExternalApiVerified === true, "No external API must be verified.");
assert(auditA.checks.noMutationVerified === true, "No mutation must be verified.");
assert(auditA.checks.noExecutionVerified === true, "No execution must be verified.");
assert(auditA.checks.noInvestmentApprovalVerified === true, "No investment approval must be verified.");
assert(auditA.checks.noFinancialAdviceVerified === true, "No financial advice must be verified.");
assert(auditA.checks.noSoulWriteVerified === true, "No S:\\SOUL write must be verified.");
assert(auditA.checks.finalActionBlankVerified === true, "Final action blank must be verified.");

assert(auditA.readOnly === true, "Readiness audit must be read-only.");
assert(auditA.deterministic === true, "Readiness audit must be deterministic.");
assert(auditA.localOnly === true, "Readiness audit must be local-only.");
assert(auditA.mayUseLiveData === false, "Readiness audit must not use live data.");
assert(auditA.mayCallExternalApi === false, "Readiness audit must not call external APIs.");
assert(auditA.mayMutateState === false, "Readiness audit must not mutate state.");
assert(auditA.mayExecuteTrade === false, "Readiness audit must not execute trade.");
assert(auditA.mayApproveInvestment === false, "Readiness audit must not approve investment.");
assert(auditA.mayProvideFinancialAdvice === false, "Readiness audit must not provide financial advice.");
assert(auditA.mayWriteSoul === false, "Readiness audit must not write S:\\SOUL.");
assert(auditA.humanReviewRequired === true, "Readiness audit must require human review.");
assert(auditA.finalAuthority === "Human", "Human authority must remain final.");
assert(auditA.finalAction === "", "Final action must remain blank.");
assert(Object.isFrozen(auditA), "Readiness audit packet must be frozen.");
assert(Object.isFrozen(auditA.gates), "Readiness gates must be frozen.");

console.log("AIM_PASS_15_PRODUCT_READINESS_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "product readiness audit created",
      "audit deterministic",
      "AIM product name preserved",
      "v0.1 local version locked",
      "manual intake verified",
      "decision queue verified",
      "PAI-SAFE review verified",
      "journal verified",
      "fixture export verified",
      "preview harness verified",
      "static render verified",
      "browser verification verified",
      "local record verified",
      "watchlist verified",
      "human review verified",
      "feedback summary verified",
      "read-only integrity verified",
      "local-only behavior verified",
      "human authority verified",
      "no live data",
      "no external API",
      "no mutation",
      "no trade execution",
      "no investment approval",
      "no financial advice",
      "no S:\\SOUL write",
      "final action remains blank",
      "all readiness gates passed",
      "AIM v0.1 local working product confirmed"
    ],
    auditStatus: auditA.status,
    readinessScore: auditA.readinessScore,
    passedCheckCount: auditA.passedCheckCount,
    totalCheckCount: auditA.totalCheckCount,
    localWorkingProduct: auditA.localWorkingProduct
  },
  null,
  2
));