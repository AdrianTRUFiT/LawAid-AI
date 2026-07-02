import {
  buildAimManualEvidenceIntakeScreen,
  validateAimManualEvidenceDraft,
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

const validation = validateAimManualEvidenceDraft(validDraft);
const screen = buildAimManualEvidenceIntakeScreen(validDraft);

assert(validation.status === "INTAKE_READY", "Valid manual evidence draft should be intake ready.");
assert(validation.readyForFlow === true, "Valid manual evidence draft should be ready for local flow.");
assert(validation.humanReviewRequired === true, "Manual intake validation must require human review.");
assert(validation.finalAuthority === "Human", "Manual intake validation must preserve human authority.");
assert(validation.finalAction === "", "Manual intake validation final action must remain blank.");

assert(screen.status === "INTAKE_READY", "Manual evidence intake screen should be ready.");
assert(screen.title === "AIM Manual Evidence Intake", "Manual evidence intake title should be locked.");
assert(screen.fieldGroups.length === 5, "Manual intake should expose five field groups.");
assert(screen.fieldGroups.some((group) => group.groupId === "source_context"), "Source context group required.");
assert(screen.fieldGroups.some((group) => group.groupId === "signal_context"), "Signal context group required.");
assert(screen.fieldGroups.some((group) => group.groupId === "thesis_context"), "Thesis context group required.");
assert(screen.fieldGroups.some((group) => group.groupId === "risk_context"), "Risk context group required.");
assert(screen.fieldGroups.some((group) => group.groupId === "review_context"), "Review context group required.");
assert(screen.readOnlySchema === true, "Screen schema must be read-only.");
assert(screen.maySubmitToLocalFlow === true, "Ready screen may submit to local flow.");
assert(screen.mayMutateExistingRecords === false, "Manual intake must not mutate existing records.");
assert(screen.mayExecuteTrade === false, "Manual intake must not execute trade.");
assert(screen.mayApproveInvestment === false, "Manual intake must not approve investment.");
assert(screen.mayProvideFinancialAdvice === false, "Manual intake must not provide financial advice.");
assert(screen.mayWriteSoul === false, "Manual intake must not write S:\\SOUL.");
assert(screen.finalAction === "", "Manual intake final action must remain blank.");
assert(Object.isFrozen(screen), "Manual intake screen packet must be frozen.");
assert(Object.isFrozen(screen.fieldGroups), "Manual intake field groups must be frozen.");

const missingDraft = {
  ...validDraft,
  draftId: "",
  sourceInputs: [],
  documentationRefs: [],
  assetOrSubject: "",
  evidenceSummary: "",
  proposedAction: ""
};

const missingValidation = validateAimManualEvidenceDraft(missingDraft);
const missingScreen = buildAimManualEvidenceIntakeScreen(missingDraft);

assert(missingValidation.status === "INTAKE_HELD_FOR_REQUIRED_FIELDS", "Missing required fields should hold intake.");
assert(missingValidation.readyForFlow === false, "Missing draft should not be ready for flow.");
assert(missingValidation.issues.includes("MISSING_DRAFT_ID"), "Missing draft ID should be flagged.");
assert(missingValidation.issues.includes("MISSING_SOURCE_INPUTS"), "Missing source inputs should be flagged.");
assert(missingValidation.issues.includes("MISSING_DOCUMENTATION_REFS"), "Missing documentation refs should be flagged.");
assert(missingValidation.issues.includes("MISSING_ASSET_OR_SUBJECT"), "Missing asset or subject should be flagged.");
assert(missingValidation.issues.includes("MISSING_EVIDENCE_SUMMARY"), "Missing evidence summary should be flagged.");
assert(missingValidation.issues.includes("MISSING_PROPOSED_ACTION"), "Missing proposed action should be flagged.");
assert(missingScreen.maySubmitToLocalFlow === false, "Held screen must not submit to local flow.");

const prohibitedDraft = {
  ...validDraft,
  proposedAction: "Buy now and execute trade immediately."
};

const prohibitedValidation = validateAimManualEvidenceDraft(prohibitedDraft);
const prohibitedScreen = buildAimManualEvidenceIntakeScreen(prohibitedDraft);

assert(prohibitedValidation.status === "INTAKE_REFUSED_FOR_PROHIBITED_ACTION", "Prohibited trade language should refuse intake.");
assert(prohibitedValidation.prohibitedActionDetected === true, "Prohibited action must be detected.");
assert(prohibitedValidation.readyForFlow === false, "Prohibited draft should not be ready for flow.");
assert(prohibitedValidation.issues.includes("PROHIBITED_ACTION_LANGUAGE"), "Prohibited action issue should be present.");
assert(prohibitedScreen.maySubmitToLocalFlow === false, "Refused screen must not submit to local flow.");

const emptyValidation = validateAimManualEvidenceDraft();
assert(emptyValidation.status === "INTAKE_REFUSED_FOR_EMPTY_DRAFT", "Empty draft should be refused.");
assert(emptyValidation.readyForFlow === false, "Empty draft should not be ready for flow.");

console.log("AIM_PASS_9_MANUAL_INTAKE_STATE_SMOKE=PASS");
console.log(JSON.stringify(
  {
    status: "PASS",
    tested: [
      "manual intake screen packet created",
      "field groups created",
      "required-field validation works",
      "missing-field hold works",
      "prohibited action refusal works",
      "empty draft refusal works",
      "local flow submission only allowed when intake ready",
      "no mutation authority",
      "no trade execution",
      "no investment approval",
      "no financial advice",
      "no S:\\SOUL write",
      "final action remains blank",
      "human authority remains final"
    ],
    validStatus: validation.status,
    missingStatus: missingValidation.status,
    prohibitedStatus: prohibitedValidation.status
  },
  null,
  2
));