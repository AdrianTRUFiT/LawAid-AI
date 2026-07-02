import {
  AIM_PAI_SAFE_DECISION_STATUS,
  buildAimDecisionItem,
  buildAimFixtureExportPacket,
  buildAimJournalPackets,
  buildAimPreviewHarnessPacket,
  getAimStaticRenderHash,
  renderAimStaticPreviewPacket,
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
  sourceInputs: ["single_unconfirmed_source"],
  evidenceStrength: "Weak"
});

assert(safeDecision.paiSafeStatus === AIM_PAI_SAFE_DECISION_STATUS.SAFE_TO_REVIEW, "Safe decision must be ready.");
assert(holdDecision.paiSafeStatus === AIM_PAI_SAFE_DECISION_STATUS.HOLD_FOR_CONFIRMATION, "Hold decision must hold.");
assert(refusedDecision.paiSafeStatus === AIM_PAI_SAFE_DECISION_STATUS.REFUSED_INSUFFICIENT_SIGNAL, "Refused decision must refuse.");

const decisions = [safeDecision, holdDecision, refusedDecision];
const journals = buildAimJournalPackets(decisions);
const fixtureExport = buildAimFixtureExportPacket(decisions, journals, "operator", "2026-05-14T13:00:00.000Z");
const previewHarness = buildAimPreviewHarnessPacket(fixtureExport, "operator", "2026-05-14T14:00:00.000Z");

const staticRenderA = renderAimStaticPreviewPacket(previewHarness, "2026-05-14T15:00:00.000Z");
const staticRenderB = renderAimStaticPreviewPacket(previewHarness, "2026-05-14T15:00:00.000Z");

assert(staticRenderA.staticRenderId === staticRenderB.staticRenderId, "Static render ID must be deterministic.");
assert(getAimStaticRenderHash(staticRenderA) === getAimStaticRenderHash(staticRenderB), "Static render hash must be deterministic.");
assert(staticRenderA.status === "STATIC_RENDER_READY", "Ready preview should produce static render ready.");
assert(staticRenderA.panelCount === previewHarness.panelCount, "Static render panel count should match preview harness.");
assert(staticRenderA.renderedPanels.length === previewHarness.panels.length, "Rendered panel length should match preview panels.");
assert(staticRenderA.html.includes("<!doctype html>"), "Static HTML must include doctype.");
assert(staticRenderA.html.includes("data-aim-static-preview=\"true\""), "Static HTML must include preview root.");
assert(staticRenderA.html.includes("AIM — AI MarketIntel"), "Static HTML must include AIM brand.");
assert(staticRenderA.html.includes("Human authority remains final"), "Static HTML must preserve human authority language.");
assert(staticRenderA.html.includes("aim-panel"), "Static HTML must include panels.");
assert(staticRenderA.readOnly === true, "Static render must be read-only.");
assert(staticRenderA.deterministic === true, "Static render must be deterministic.");
assert(staticRenderA.staticOnly === true, "Static render must be static-only.");
assert(staticRenderA.mayRenderReactUi === false, "Static renderer must not render React UI.");
assert(staticRenderA.mayMutateState === false, "Static renderer must not mutate state.");
assert(staticRenderA.mayExecuteTrade === false, "Static renderer must not execute trades.");
assert(staticRenderA.mayApproveInvestment === false, "Static renderer must not approve investments.");
assert(staticRenderA.mayProvideFinancialAdvice === false, "Static renderer must not provide financial advice.");
assert(staticRenderA.mayWriteSoul === false, "Static renderer must not write S:\\SOUL.");
assert(staticRenderA.finalAction === "", "Final action must remain blank.");
assert(Object.isFrozen(staticRenderA), "Static render packet must be frozen.");
assert(Object.isFrozen(staticRenderA.renderedPanels), "Rendered panels array must be frozen.");

for (const panel of staticRenderA.renderedPanels) {
  assert(panel.readOnly === true, "Rendered panel must be read-only.");
  assert(panel.mayMutateSource === false, "Rendered panel must not mutate source.");
  assert(panel.mayExecuteTrade === false, "Rendered panel must not execute trade.");
  assert(panel.mayApproveInvestment === false, "Rendered panel must not approve investment.");
  assert(panel.mayProvideFinancialAdvice === false, "Rendered panel must not provide financial advice.");
  assert(panel.mayWriteSoul === false, "Rendered panel must not write S:\\SOUL.");
  assert(panel.finalAction === "", "Rendered panel final action must remain blank.");
  assert(Object.isFrozen(panel), "Rendered panel must be frozen.");
}

console.log("AIM_PASS_7_STATIC_RENDERER_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "minimal static preview renderer created",
      "static HTML generated",
      "AIM brand visible",
      "preview root visible",
      "panels rendered",
      "deterministic static render hash",
      "static render packet frozen",
      "rendered panels frozen",
      "no React UI authority",
      "no mutation authority",
      "no trade execution",
      "no investment approval",
      "no financial advice",
      "no S:\\SOUL write",
      "final action remains blank",
      "human authority remains final"
    ],
    staticRenderId: staticRenderA.staticRenderId,
    staticRenderStatus: staticRenderA.status,
    panelCount: staticRenderA.panelCount,
    staticRenderHash: getAimStaticRenderHash(staticRenderA)
  },
  null,
  2
));