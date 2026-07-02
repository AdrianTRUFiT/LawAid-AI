import {
  buildAimManualIntakeDraftPayloadPacket,
  buildAimManualIntakeUiPacket,
  verifyAimManualIntakeUiGovernance,
  type AimManualEvidenceDraft
} from "../src/index.js";
import { validDraft } from "./aim-test-draft.js";

function assert(condition: unknown, message: string): void {
  if (!condition) throw new Error(message);
}

const uiA = buildAimManualIntakeUiPacket(validDraft);
const uiB = buildAimManualIntakeUiPacket(validDraft);
const payload = buildAimManualIntakeDraftPayloadPacket(uiA, validDraft);
const governance = verifyAimManualIntakeUiGovernance(uiA, payload);

assert(uiA.uiHash === uiB.uiHash, "Manual intake UI hash must be deterministic.");
assert(uiA.title === "AIM Manual Evidence Intake", "Manual intake UI title must be locked.");
assert(uiA.sourceDraftId === validDraft.draftId, "Manual intake UI must preserve source draft ID.");
assert(uiA.intakeStatus === "INTAKE_READY", "Valid draft should create INTAKE_READY UI.");
assert(uiA.uiStatus === "INTAKE_UI_READY", "Valid draft should create ready UI status.");
assert(uiA.sectionCount === 5, "Manual intake UI must have five sections.");
assert(uiA.sections.length === 5, "Manual intake UI section count must match.");
assert(uiA.htmlPreview.includes("AIM Manual Evidence Intake"), "HTML preview must show intake title.");
assert(uiA.htmlPreview.includes("Controlled input surface"), "HTML preview must show controlled input language.");
assert(uiA.htmlPreview.includes("data-aim-manual-intake-ui=\"true\""), "HTML preview must include intake UI root.");

const sectionIds = new Set(uiA.sections.map((section) => section.sectionId));
assert(sectionIds.has("source_context"), "Source context section required.");
assert(sectionIds.has("signal_context"), "Signal context section required.");
assert(sectionIds.has("thesis_context"), "Thesis context section required.");
assert(sectionIds.has("risk_context"), "Risk context section required.");
assert(sectionIds.has("review_context"), "Review context section required.");

const allFields = uiA.sections.flatMap((section) => section.fields);
const fieldNames = new Set(allFields.map((field) => field.sourceDraftField));

assert(fieldNames.has("sourceType"), "Source type field required.");
assert(fieldNames.has("sourceInputs"), "Source inputs field required.");
assert(fieldNames.has("documentationRefs"), "Documentation refs field required.");
assert(fieldNames.has("signalType"), "Signal type field required.");
assert(fieldNames.has("assetOrSubject"), "Asset or subject field required.");
assert(fieldNames.has("infrastructureLayer"), "Infrastructure layer field required.");
assert(fieldNames.has("dependencyClaim"), "Dependency claim field required.");
assert(fieldNames.has("thesisReference"), "Thesis reference field required.");
assert(fieldNames.has("evidenceSummary"), "Evidence summary field required.");
assert(fieldNames.has("operatorThesisNote"), "Operator thesis note field required.");
assert(fieldNames.has("evidenceStrength"), "Evidence strength field required.");
assert(fieldNames.has("riskClass"), "Risk class field required.");
assert(fieldNames.has("timingContext"), "Timing context field required.");
assert(fieldNames.has("urgencyLevel"), "Urgency level field required.");
assert(fieldNames.has("contradictionFlags"), "Contradiction flags field required.");
assert(fieldNames.has("proposedAction"), "Proposed action field required.");
assert(fieldNames.has("nextStep"), "Next step field required.");

assert(uiA.readOnlySchema === true, "Manual intake UI schema must be read-only.");
assert(uiA.controlledInputOnly === true, "Manual intake UI must be controlled input only.");
assert(uiA.localOnly === true, "Manual intake UI must be local-only.");
assert(uiA.mayPrepareDraftPayload === true, "Ready UI may prepare local draft payload.");
assert(uiA.maySubmitToLocalFlow === true, "Ready UI may submit to local flow.");
assert(uiA.mayMutateVerifiedAimOutput === false, "Manual intake UI must not mutate verified AIM output.");
assert(uiA.mayMutateJournal === false, "Manual intake UI must not mutate journal.");
assert(uiA.mayCreateTruth === false, "Manual intake UI must not create truth.");
assert(uiA.mayGovern === false, "Manual intake UI must not govern.");
assert(uiA.mayApproveDecision === false, "Manual intake UI must not approve decisions.");
assert(uiA.mayExecuteTrade === false, "Manual intake UI must not execute trade.");
assert(uiA.mayProvideFinancialAdvice === false, "Manual intake UI must not provide financial advice.");
assert(uiA.mayUseLiveData === false, "Manual intake UI must not use live data.");
assert(uiA.mayCallExternalApi === false, "Manual intake UI must not call external APIs.");
assert(uiA.finalAuthority === "Human", "Human authority must remain final.");
assert(uiA.finalAction === "", "Manual intake UI final action must remain blank.");
assert(Object.isFrozen(uiA), "Manual intake UI packet must be frozen.");
assert(Object.isFrozen(uiA.sections), "Manual intake UI sections must be frozen.");

for (const section of uiA.sections) {
  assert(section.readOnlySchema === true, "Every section schema must be read-only.");
  assert(section.mayMutateVerifiedAimOutput === false, "Section must not mutate AIM output.");
  assert(section.mayMutateJournal === false, "Section must not mutate journal.");
  assert(Object.isFrozen(section), "Every section must be frozen.");

  for (const field of section.fields) {
    assert(field.readOnlyExistingTruth === true, "Field must treat existing truth as read-only.");
    assert(field.mayMutateVerifiedAimOutput === false, "Field must not mutate AIM output.");
    assert(field.mayMutateJournal === false, "Field must not mutate journal.");
    assert(Object.isFrozen(field), "Every field must be frozen.");
  }
}

assert(payload.sourceUiId === uiA.uiId, "Payload must point to source UI.");
assert(payload.validationStatus === "INTAKE_READY", "Payload validation status must be ready.");
assert(payload.readyForLocalFlow === true, "Payload should be ready for local flow.");
assert(payload.draft.draftId === validDraft.draftId, "Payload must preserve draft ID.");
assert(payload.draft.evidenceSummary === validDraft.evidenceSummary, "Payload must preserve evidence summary.");
assert(payload.localOnly === true, "Payload must be local-only.");
assert(payload.mayMutateVerifiedAimOutput === false, "Payload must not mutate AIM output.");
assert(payload.mayMutateJournal === false, "Payload must not mutate journal.");
assert(payload.mayExecuteTrade === false, "Payload must not execute trade.");
assert(payload.mayApproveDecision === false, "Payload must not approve decision.");
assert(payload.mayProvideFinancialAdvice === false, "Payload must not provide financial advice.");
assert(payload.mayUseLiveData === false, "Payload must not use live data.");
assert(payload.mayCallExternalApi === false, "Payload must not call external API.");
assert(payload.finalAuthority === "Human", "Payload must preserve human authority.");
assert(payload.finalAction === "", "Payload final action must remain blank.");
assert(Object.isFrozen(payload), "Payload packet must be frozen.");

assert(governance.status === "INTAKE_UI_GOVERNANCE_VERIFIED", "Manual intake UI governance should verify.");
assert(governance.refusalReasons.length === 0, "Manual intake UI governance should have no refusal reasons.");

for (const [check, passed] of Object.entries(governance.checks)) {
  assert(passed === true, "Manual intake UI governance check failed: " + check);
}

const heldDraft: AimManualEvidenceDraft = {
  ...validDraft,
  draftId: "draft_intake_ui_held_001",
  evidenceSummary: "",
  sourceInputs: [],
  documentationRefs: []
};

const heldUi = buildAimManualIntakeUiPacket(heldDraft);
const heldPayload = buildAimManualIntakeDraftPayloadPacket(heldUi, heldDraft);
const heldGovernance = verifyAimManualIntakeUiGovernance(heldUi, heldPayload);

assert(heldUi.intakeStatus === "INTAKE_HELD_FOR_REQUIRED_FIELDS", "Missing fields should create held intake UI.");
assert(heldUi.uiStatus === "INTAKE_UI_HELD", "Missing fields should create held UI status.");
assert(heldUi.mayPrepareDraftPayload === false, "Held UI must not prepare local payload.");
assert(heldUi.maySubmitToLocalFlow === false, "Held UI must not submit to local flow.");
assert(heldPayload.readyForLocalFlow === false, "Held payload must not be ready for local flow.");
assert(heldGovernance.status === "INTAKE_UI_GOVERNANCE_VERIFIED", "Held UI should still pass governance boundaries.");

const refusedDraft: AimManualEvidenceDraft = {
  ...validDraft,
  draftId: "draft_intake_ui_refused_001",
  proposedAction: "Buy now and execute trade immediately."
};

const refusedUi = buildAimManualIntakeUiPacket(refusedDraft);
const refusedPayload = buildAimManualIntakeDraftPayloadPacket(refusedUi, refusedDraft);
const refusedGovernance = verifyAimManualIntakeUiGovernance(refusedUi, refusedPayload);

assert(refusedUi.intakeStatus === "INTAKE_REFUSED_FOR_PROHIBITED_ACTION", "Prohibited action should refuse intake UI.");
assert(refusedUi.uiStatus === "INTAKE_UI_REFUSED", "Prohibited action should create refused UI status.");
assert(refusedUi.mayPrepareDraftPayload === false, "Refused UI must not prepare draft payload.");
assert(refusedUi.maySubmitToLocalFlow === false, "Refused UI must not submit to local flow.");
assert(refusedPayload.readyForLocalFlow === false, "Refused payload must not be ready for local flow.");
assert(refusedGovernance.status === "INTAKE_UI_GOVERNANCE_VERIFIED", "Refused UI should still pass governance boundaries.");

console.log("AIM_V02_MANUAL_INTAKE_UI_SPRINT2_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "manual intake UI packet created",
      "manual intake UI hash deterministic",
      "source draft ID preserved",
      "five intake sections visible",
      "source context visible",
      "signal context visible",
      "thesis context visible",
      "risk context visible",
      "review context visible",
      "required fields visible",
      "HTML preview created",
      "controlled input language visible",
      "draft payload packet created",
      "payload preserves draft fields",
      "ready UI can prepare local flow payload",
      "held UI blocks local flow submission",
      "refused UI blocks local flow submission",
      "governance verification passes ready state",
      "governance verification passes held state",
      "governance verification passes refused state",
      "UI packet frozen",
      "payload packet frozen",
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
    uiStatus: uiA.uiStatus,
    heldUiStatus: heldUi.uiStatus,
    refusedUiStatus: refusedUi.uiStatus,
    uiHash: uiA.uiHash
  },
  null,
  2
));