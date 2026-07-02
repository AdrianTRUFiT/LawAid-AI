import {
  buildAimManualEvidenceIntakeScreen,
  validateAimManualEvidenceDraft
} from "./aimOperatorWorkflowEngine.js";
import type {
  AimManualEvidenceDraft
} from "./aimOperatorWorkflowContracts.js";
import type {
  AimManualIntakeDraftPayloadPacket,
  AimManualIntakeUiField,
  AimManualIntakeUiGovernancePacket,
  AimManualIntakeUiPacket,
  AimManualIntakeUiSection,
  AimManualIntakeUiStatus
} from "./aimManualIntakeUiContracts.js";

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 72) || "intake_ui";
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return "[" + value.map((item) => stableStringify(item)).join(",") + "]";
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
  return "{" + entries.map(([key, item]) => JSON.stringify(key) + ":" + stableStringify(item)).join(",") + "}";
}

function simpleDeterministicHash(value: unknown): string {
  const input = stableStringify(value);
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return "aim_intake_ui_hash_" + (hash >>> 0).toString(16).padStart(8, "0");
}

function freezeDeep<T>(value: T): Readonly<T> {
  if (value && typeof value === "object") {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const child = (value as Record<string, unknown>)[key];
      if (child && typeof child === "object" && !Object.isFrozen(child)) freezeDeep(child);
    }
    Object.freeze(value);
  }
  return value as Readonly<T>;
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function field(
  sourceDraftField: keyof AimManualEvidenceDraft,
  label: string,
  kind: AimManualIntakeUiField["kind"],
  required: boolean,
  value: string | string[],
  placeholder: string
): AimManualIntakeUiField {
  return freezeDeep({
    fieldId: "aim_intake_field_" + stableIdPart(String(sourceDraftField)),
    label,
    kind,
    required,
    value,
    placeholder,
    sourceDraftField,
    readOnlyExistingTruth: true,
    mayMutateVerifiedAimOutput: false,
    mayMutateJournal: false
  }) as AimManualIntakeUiField;
}

function section(
  sectionId: string,
  title: string,
  description: string,
  statusLabel: string,
  fields: AimManualIntakeUiField[]
): AimManualIntakeUiSection {
  return freezeDeep({
    sectionId,
    title,
    description,
    statusLabel,
    fields,
    readOnlySchema: true,
    mayMutateVerifiedAimOutput: false,
    mayMutateJournal: false
  }) as AimManualIntakeUiSection;
}

export function deriveAimManualIntakeUiStatus(status: string): AimManualIntakeUiStatus {
  if (status === "INTAKE_READY") return "INTAKE_UI_READY";
  if (status === "INTAKE_HELD_FOR_REQUIRED_FIELDS") return "INTAKE_UI_HELD";
  return "INTAKE_UI_REFUSED";
}

export function buildAimManualIntakeUiSections(draft: AimManualEvidenceDraft, statusLabel: string): AimManualIntakeUiSection[] {
  return [
    section("source_context", "Source Context", "Where the evidence came from and how it is documented.", statusLabel, [
      field("sourceType", "Source Type", "select", true, draft.sourceType, "Select source type"),
      field("sourceInputs", "Source Inputs", "list", true, draft.sourceInputs, "Add source references"),
      field("documentationRefs", "Documentation References", "list", true, draft.documentationRefs, "Add documentation references")
    ]),
    section("signal_context", "Signal Context", "What pressure signal is being observed.", statusLabel, [
      field("signalType", "Signal Type", "select", true, draft.signalType, "Select signal type"),
      field("assetOrSubject", "Asset or Subject", "text", true, draft.assetOrSubject, "Example: HBM supply chain"),
      field("infrastructureLayer", "Infrastructure Layer", "text", true, draft.infrastructureLayer, "Example: Memory / HBM"),
      field("dependencyClaim", "Dependency Claim", "textarea", true, draft.dependencyClaim, "Describe the dependency")
    ]),
    section("thesis_context", "Thesis Context", "Why this signal matters and what thesis it relates to.", statusLabel, [
      field("thesisReference", "Thesis Reference", "text", true, draft.thesisReference, "Add thesis reference"),
      field("evidenceSummary", "Evidence Summary", "textarea", true, draft.evidenceSummary, "Summarize the evidence"),
      field("operatorThesisNote", "Operator Thesis Note", "textarea", true, draft.operatorThesisNote, "Add operator note")
    ]),
    section("risk_context", "Risk Context", "Evidence strength, risk, timing, urgency, and contradictions.", statusLabel, [
      field("evidenceStrength", "Evidence Strength", "select", true, draft.evidenceStrength, "Select evidence strength"),
      field("riskClass", "Risk Class", "select", true, draft.riskClass, "Select risk class"),
      field("timingContext", "Timing Context", "select", true, draft.timingContext, "Select timing context"),
      field("urgencyLevel", "Urgency Level", "select", true, draft.urgencyLevel, "Select urgency"),
      field("contradictionFlags", "Contradiction Flags", "list", false, draft.contradictionFlags, "Add contradictions if present")
    ]),
    section("review_context", "Review Context", "What the operator should do next without creating execution authority.", statusLabel, [
      field("proposedAction", "Proposed Action", "textarea", true, draft.proposedAction, "Review-only action language"),
      field("nextStep", "Next Step", "textarea", true, draft.nextStep, "Human review next step"),
      field("operatorContradictionNote", "Operator Contradiction Note", "textarea", false, draft.operatorContradictionNote, "Optional contradiction note")
    ])
  ];
}

export function renderAimManualIntakeUiHtml(packet: Omit<AimManualIntakeUiPacket, "htmlPreview">): string {
  const sections = packet.sections.map((item) => {
    const fields = item.fields.map((entry) => {
      const value = Array.isArray(entry.value) ? entry.value.join(", ") : entry.value;
      return "<div class=\"aim-intake-field\" data-field-id=\"" + escapeHtml(entry.fieldId) + "\">" +
        "<label>" + escapeHtml(entry.label) + "</label>" +
        "<div class=\"aim-intake-value\">" + escapeHtml(value) + "</div>" +
        "<small>" + escapeHtml(entry.placeholder) + "</small>" +
        "</div>";
    }).join("");

    return "<article class=\"aim-intake-section\" data-section-id=\"" + escapeHtml(item.sectionId) + "\">" +
      "<h2>" + escapeHtml(item.title) + "</h2>" +
      "<p>" + escapeHtml(item.description) + "</p>" +
      "<strong>" + escapeHtml(item.statusLabel) + "</strong>" +
      fields +
      "</article>";
  }).join("");

  return "<main data-aim-manual-intake-ui=\"true\">" +
    "<header><h1>AIM Manual Evidence Intake</h1><p>Controlled input surface. Review only. No execution authority.</p></header>" +
    "<section class=\"aim-intake-grid\">" + sections + "</section>" +
    "</main>";
}

export function buildAimManualIntakeUiPacket(
  draft: AimManualEvidenceDraft,
  createdAt = "2026-05-14T20:00:00.000Z"
): AimManualIntakeUiPacket {
  const intakeScreen = buildAimManualEvidenceIntakeScreen(draft, createdAt);
  const uiStatus = deriveAimManualIntakeUiStatus(intakeScreen.status);
  const sections = buildAimManualIntakeUiSections(draft, intakeScreen.status);
  const uiHash = simpleDeterministicHash({
    draftId: draft.draftId,
    intakeStatus: intakeScreen.status,
    sections: sections.map((item) => ({
      sectionId: item.sectionId,
      fields: item.fields.map((entry) => ({
        sourceDraftField: entry.sourceDraftField,
        value: entry.value
      }))
    }))
  });

  const base = freezeDeep({
    uiId: "aim_manual_intake_ui_" + stableIdPart(draft.draftId),
    createdAt,
    title: "AIM Manual Evidence Intake",
    subtitle: "Bounded local input surface for AIM evidence intake.",
    sourceDraftId: draft.draftId,
    intakeStatus: intakeScreen.status,
    uiStatus,
    intakeScreen,
    sections,
    sectionCount: sections.length,
    htmlPreview: "",
    uiHash,
    readOnlySchema: true,
    controlledInputOnly: true,
    localOnly: true,
    mayPrepareDraftPayload: intakeScreen.validation.readyForFlow,
    maySubmitToLocalFlow: intakeScreen.validation.readyForFlow,
    mayMutateVerifiedAimOutput: false,
    mayMutateJournal: false,
    mayCreateTruth: false,
    mayGovern: false,
    mayApproveDecision: false,
    mayExecuteTrade: false,
    mayProvideFinancialAdvice: false,
    mayUseLiveData: false,
    mayCallExternalApi: false,
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: ""
  }) as Omit<AimManualIntakeUiPacket, "htmlPreview">;

  return freezeDeep({
    ...base,
    htmlPreview: renderAimManualIntakeUiHtml(base)
  }) as AimManualIntakeUiPacket;
}

export function buildAimManualIntakeDraftPayloadPacket(
  uiPacket: AimManualIntakeUiPacket,
  draft: AimManualEvidenceDraft,
  createdAt = "2026-05-14T20:05:00.000Z"
): AimManualIntakeDraftPayloadPacket {
  const validation = validateAimManualEvidenceDraft(draft);
  const payloadHash = simpleDeterministicHash({
    sourceUiId: uiPacket.uiId,
    draft,
    validationStatus: validation.status
  });

  return freezeDeep({
    payloadId: "aim_manual_intake_payload_" + stableIdPart(draft.draftId),
    createdAt,
    sourceUiId: uiPacket.uiId,
    draft: {
      ...draft,
      sourceInputs: [...draft.sourceInputs],
      documentationRefs: [...draft.documentationRefs],
      contradictionFlags: [...draft.contradictionFlags]
    },
    validationStatus: validation.status,
    readyForLocalFlow: validation.readyForFlow,
    payloadHash,
    localOnly: true,
    mayMutateVerifiedAimOutput: false,
    mayMutateJournal: false,
    mayExecuteTrade: false,
    mayApproveDecision: false,
    mayProvideFinancialAdvice: false,
    mayUseLiveData: false,
    mayCallExternalApi: false,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimManualIntakeDraftPayloadPacket;
}

export function verifyAimManualIntakeUiGovernance(
  uiPacket: AimManualIntakeUiPacket,
  payloadPacket: AimManualIntakeDraftPayloadPacket
): AimManualIntakeUiGovernancePacket {
  const checks: Record<string, boolean> = {
    uiReadOnlySchema: uiPacket.readOnlySchema === true,
    controlledInputOnly: uiPacket.controlledInputOnly === true,
    localOnly: uiPacket.localOnly === true && payloadPacket.localOnly === true,
    mayPrepareOnlyWhenReady: uiPacket.mayPrepareDraftPayload === uiPacket.intakeScreen.validation.readyForFlow,
    maySubmitOnlyWhenReady: uiPacket.maySubmitToLocalFlow === uiPacket.intakeScreen.validation.readyForFlow,
    noAimOutputMutation: uiPacket.mayMutateVerifiedAimOutput === false && payloadPacket.mayMutateVerifiedAimOutput === false,
    noJournalMutation: uiPacket.mayMutateJournal === false && payloadPacket.mayMutateJournal === false,
    noTruthCreation: uiPacket.mayCreateTruth === false,
    noGovernanceAuthority: uiPacket.mayGovern === false,
    noDecisionApproval: uiPacket.mayApproveDecision === false && payloadPacket.mayApproveDecision === false,
    noTradeExecution: uiPacket.mayExecuteTrade === false && payloadPacket.mayExecuteTrade === false,
    noFinancialAdvice: uiPacket.mayProvideFinancialAdvice === false && payloadPacket.mayProvideFinancialAdvice === false,
    noLiveData: uiPacket.mayUseLiveData === false && payloadPacket.mayUseLiveData === false,
    noExternalApi: uiPacket.mayCallExternalApi === false && payloadPacket.mayCallExternalApi === false,
    humanAuthorityFinal: uiPacket.finalAuthority === "Human" && payloadPacket.finalAuthority === "Human",
    finalActionBlank: uiPacket.finalAction === "" && payloadPacket.finalAction === "",
    sectionsReadOnly: uiPacket.sections.every((item) =>
      item.readOnlySchema === true &&
      item.mayMutateVerifiedAimOutput === false &&
      item.mayMutateJournal === false &&
      item.fields.every((entry) =>
        entry.readOnlyExistingTruth === true &&
        entry.mayMutateVerifiedAimOutput === false &&
        entry.mayMutateJournal === false
      )
    )
  };

  const refusalReasons = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([key]) => key);

  return freezeDeep({
    governanceId: "aim_manual_intake_ui_governance_" + stableIdPart(uiPacket.uiId),
    createdAt: "2026-05-14T20:10:00.000Z",
    sourceUiId: uiPacket.uiId,
    checks,
    status: refusalReasons.length === 0 ? "INTAKE_UI_GOVERNANCE_VERIFIED" : "INTAKE_UI_GOVERNANCE_REFUSED",
    refusalReasons,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimManualIntakeUiGovernancePacket;
}