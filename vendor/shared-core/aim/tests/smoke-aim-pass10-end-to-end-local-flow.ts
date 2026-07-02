import {
  AIM_PAI_SAFE_DECISION_STATUS,
  buildAimOperatorEndToEndLocalFlow,
  type AimManualEvidenceDraft
} from "../src/index.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const validDraft: AimManualEvidenceDraft = {
  draftId: "draft_hbm_001",
  createdAt: "2026-05-14T16:00:00.000Z",
  sourceType: "public filing",
  sourceInputs: ["source_public_filing_001", "source_company_announcement_002"],
  documentationRefs: ["doc_hbm_001", "doc_hbm_002"],
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
  nextStep: "Human review only. Preserve journal before any decision.",
  infrastructureLayer: "Memory / HBM",
  dependencyClaim: "AI accelerator availability depends on HBM allocation discipline.",
  operatorThesisNote: "Track dependency pressure without converting research into trade instruction.",
  operatorContradictionNote: ""
};

const flowA = buildAimOperatorEndToEndLocalFlow(validDraft, "operator", "2026-05-14T16:10:00.000Z");
const flowB = buildAimOperatorEndToEndLocalFlow(validDraft, "operator", "2026-05-14T16:10:00.000Z");

assert(flowA.flowHash === flowB.flowHash, "Operator end-to-end flow must be deterministic.");
assert(flowA.status === "FLOW_COMPLETED", "Valid operator flow should complete.");
assert(flowA.intakeScreen.status === "INTAKE_READY", "Flow should include ready intake screen.");
assert(flowA.structuredDecisionInput !== undefined, "Flow should include structured decision input.");
assert(flowA.decisionItem !== undefined, "Flow should include decision item.");
assert(flowA.journalPacket !== undefined, "Flow should include journal packet.");
assert(flowA.fixtureExport !== undefined, "Flow should include fixture export.");
assert(flowA.previewHarness !== undefined, "Flow should include preview harness.");
assert(flowA.staticRender !== undefined, "Flow should include static render.");
assert(flowA.browserVerification !== undefined, "Flow should include browser verification.");

assert(flowA.decisionItem?.paiSafeStatus === AIM_PAI_SAFE_DECISION_STATUS.SAFE_TO_REVIEW, "Strong documented flow should be SAFE TO REVIEW.");
assert(flowA.journalPacket?.status === "JOURNAL_READY", "Safe decision should create ready journal.");
assert(flowA.fixtureExport?.manifest.exportStatus === "FIXTURE_EXPORT_READY", "Fixture export should be ready.");
assert(flowA.previewHarness?.status === "PREVIEW_READY", "Preview harness should be ready.");
assert(flowA.staticRender?.status === "STATIC_RENDER_READY", "Static render should be ready.");
assert(flowA.browserVerification?.status === "BROWSER_STATIC_VERIFIED", "Browser verification should pass.");
assert(flowA.browserVerification?.refusalReasons.length === 0, "Browser verification should have no refusal reasons.");

assert(flowA.readOnly === true, "Flow must be read-only.");
assert(flowA.deterministic === true, "Flow must be deterministic.");
assert(flowA.localOnly === true, "Flow must be local-only.");
assert(flowA.mayUseLiveData === false, "Flow must not use live data.");
assert(flowA.mayCallExternalApi === false, "Flow must not call external API.");
assert(flowA.mayMutateState === false, "Flow must not mutate state.");
assert(flowA.mayExecuteTrade === false, "Flow must not execute trade.");
assert(flowA.mayApproveInvestment === false, "Flow must not approve investment.");
assert(flowA.mayProvideFinancialAdvice === false, "Flow must not provide financial advice.");
assert(flowA.mayWriteSoul === false, "Flow must not write S:\\SOUL.");
assert(flowA.humanReviewRequired === true, "Flow must require human review.");
assert(flowA.finalAuthority === "Human", "Human authority must remain final.");
assert(flowA.finalAction === "", "Flow final action must remain blank.");
assert(Object.isFrozen(flowA), "Flow packet must be frozen.");

const weakDraft: AimManualEvidenceDraft = {
  ...validDraft,
  draftId: "draft_hbm_weak_001",
  sourceInputs: ["single_unconfirmed_source"],
  documentationRefs: ["doc_hbm_weak_001"],
  evidenceStrength: "Weak"
};

const weakFlow = buildAimOperatorEndToEndLocalFlow(weakDraft, "operator", "2026-05-14T16:10:00.000Z");

assert(weakFlow.status === "FLOW_COMPLETED", "Weak but valid local flow should complete as review artifact.");
assert(weakFlow.decisionItem?.paiSafeStatus === AIM_PAI_SAFE_DECISION_STATUS.REFUSED_INSUFFICIENT_SIGNAL, "Weak evidence should refuse for insufficient signal.");
assert(weakFlow.journalPacket?.status === "JOURNAL_ARCHIVED_FOR_REVIEW", "Refused decision should archive journal for review.");
assert(weakFlow.browserVerification?.status === "BROWSER_STATIC_VERIFIED", "Refused review artifact should still render safely.");

const heldDraft: AimManualEvidenceDraft = {
  ...validDraft,
  draftId: "draft_hbm_hold_001",
  evidenceStrength: "Moderate"
};

const heldFlow = buildAimOperatorEndToEndLocalFlow(heldDraft, "operator", "2026-05-14T16:10:00.000Z");

assert(heldFlow.status === "FLOW_COMPLETED", "Held decision flow should complete as previewable artifact.");
assert(heldFlow.decisionItem?.paiSafeStatus === AIM_PAI_SAFE_DECISION_STATUS.HOLD_FOR_CONFIRMATION, "Moderate evidence should hold for confirmation.");
assert(heldFlow.journalPacket?.status === "JOURNAL_HELD", "Held decision should create held journal.");

const badDraft: AimManualEvidenceDraft = {
  ...validDraft,
  draftId: "draft_bad_001",
  proposedAction: "Sell now and execute order immediately."
};

const badFlow = buildAimOperatorEndToEndLocalFlow(badDraft, "operator", "2026-05-14T16:10:00.000Z");

assert(badFlow.status === "FLOW_REFUSED_INPUT", "Prohibited input must refuse before flow execution.");
assert(badFlow.decisionItem === undefined, "Refused input must not create decision item.");
assert(badFlow.journalPacket === undefined, "Refused input must not create journal packet.");
assert(badFlow.fixtureExport === undefined, "Refused input must not create fixture export.");
assert(badFlow.previewHarness === undefined, "Refused input must not create preview harness.");
assert(badFlow.staticRender === undefined, "Refused input must not create static render.");
assert(badFlow.browserVerification === undefined, "Refused input must not create browser verification.");
assert(badFlow.mayExecuteTrade === false, "Refused flow must not execute trade.");
assert(badFlow.finalAction === "", "Refused flow final action must remain blank.");

console.log("AIM_PASS_10_END_TO_END_LOCAL_FLOW_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "manual evidence draft enters local flow",
      "intake screen validates draft",
      "structured decision input created",
      "decision item created",
      "PAI-SAFE review status created",
      "journal packet created",
      "fixture export created",
      "preview harness created",
      "static render created",
      "browser verification created",
      "strong evidence completes safe review artifact",
      "weak evidence completes refused review artifact",
      "moderate evidence completes held review artifact",
      "prohibited action refused before flow execution",
      "flow hash deterministic",
      "local-only behavior preserved",
      "no live data",
      "no external API",
      "no mutation",
      "no trade execution",
      "no investment approval",
      "no financial advice",
      "no S:\\SOUL write",
      "final action remains blank",
      "human authority remains final"
    ],
    completedFlowStatus: flowA.status,
    completedFlowHash: flowA.flowHash,
    weakPaiSafeStatus: weakFlow.decisionItem?.paiSafeStatus,
    heldPaiSafeStatus: heldFlow.decisionItem?.paiSafeStatus,
    badFlowStatus: badFlow.status
  },
  null,
  2
));