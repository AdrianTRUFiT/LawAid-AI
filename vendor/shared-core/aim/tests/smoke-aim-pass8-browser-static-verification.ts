import {
  buildAimDecisionItem,
  buildAimFixtureExportPacket,
  buildAimJournalPacket,
  buildAimJournalPackets,
  buildAimPreviewHarnessPacket,
  renderAimStaticPreviewPacket,
  verifyAimStaticBrowserPreview,
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
const holdDecision = buildAimDecisionItem({ ...baseInput, evidenceStrength: "Moderate" });
const refusedDecision = buildAimDecisionItem({
  ...baseInput,
  contradictionFlags: ["Contradiction present."],
  evidenceStrength: "Contradicted"
});

const decisions = [safeDecision, holdDecision, refusedDecision];
const journals = buildAimJournalPackets(decisions);
const fixtureExport = buildAimFixtureExportPacket(decisions, journals, "operator", "2026-05-14T13:00:00.000Z");
const previewHarness = buildAimPreviewHarnessPacket(fixtureExport, "operator", "2026-05-14T14:00:00.000Z");
const staticRender = renderAimStaticPreviewPacket(previewHarness, "2026-05-14T15:00:00.000Z");
const verification = verifyAimStaticBrowserPreview(staticRender, "2026-05-14T15:05:00.000Z");

assert(verification.status === "BROWSER_STATIC_VERIFIED", "Static browser verification should pass.");
assert(verification.refusalReasons.length === 0, "Static browser verification should have no refusal reasons.");

for (const [check, passed] of Object.entries(verification.checks)) {
  assert(passed === true, "Browser static verification check failed: " + check);
}

assert(verification.readOnly === true, "Browser verification must be read-only.");
assert(verification.mayMutateState === false, "Browser verification must not mutate state.");
assert(verification.mayExecuteTrade === false, "Browser verification must not execute trade.");
assert(verification.mayApproveInvestment === false, "Browser verification must not approve investment.");
assert(verification.mayProvideFinancialAdvice === false, "Browser verification must not provide financial advice.");
assert(verification.mayWriteSoul === false, "Browser verification must not write S:\\SOUL.");
assert(verification.finalAction === "", "Browser verification final action must remain blank.");
assert(Object.isFrozen(verification), "Browser verification packet must be frozen.");

const emptyExport = buildAimFixtureExportPacket([], [], "operator", "2026-05-14T13:00:00.000Z");
const emptyPreview = buildAimPreviewHarnessPacket(emptyExport, "operator", "2026-05-14T14:00:00.000Z");
const emptyStaticRender = renderAimStaticPreviewPacket(emptyPreview, "2026-05-14T15:00:00.000Z");
const emptyVerification = verifyAimStaticBrowserPreview(emptyStaticRender, "2026-05-14T15:05:00.000Z");

assert(emptyStaticRender.status === "STATIC_RENDER_EMPTY", "Empty preview should render as STATIC_RENDER_EMPTY.");
assert(emptyVerification.status === "BROWSER_STATIC_VERIFIED", "Empty static preview should still be browser verified.");

const refusedOnlyDecision = buildAimDecisionItem({
  ...baseInput,
  riskClass: "Excessive"
});
const refusedOnlyJournal = buildAimJournalPacket(refusedOnlyDecision);
const archivedExport = buildAimFixtureExportPacket([refusedOnlyDecision], [refusedOnlyJournal], "operator", "2026-05-14T13:00:00.000Z");
const archivedPreview = buildAimPreviewHarnessPacket(archivedExport, "operator", "2026-05-14T14:00:00.000Z");
const archivedStaticRender = renderAimStaticPreviewPacket(archivedPreview, "2026-05-14T15:00:00.000Z");
const archivedVerification = verifyAimStaticBrowserPreview(archivedStaticRender, "2026-05-14T15:05:00.000Z");

assert(archivedStaticRender.status === "STATIC_RENDER_ARCHIVED", "Archived preview should render as STATIC_RENDER_ARCHIVED.");
assert(archivedVerification.status === "BROWSER_STATIC_VERIFIED", "Archived static preview should still be browser verified.");

console.log("AIM_PASS_8_BROWSER_STATIC_VERIFICATION_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "static browser verification packet created",
      "doctype verified",
      "html tag verified",
      "viewport verified",
      "preview root verified",
      "AIM brand verified",
      "panel presence verified",
      "no button controls",
      "no input controls",
      "no form controls",
      "no execute language",
      "no buy/sell language",
      "no approval language",
      "no financial advice language",
      "no S:\\SOUL write authority",
      "no mutation authority",
      "no execution authority",
      "human authority final",
      "final action remains blank",
      "empty render verified",
      "archived render verified"
    ],
    verificationStatus: verification.status,
    refusalReasons: verification.refusalReasons
  },
  null,
  2
));