import {
  buildAimDecisionItem,
  containsProhibitedActionLanguage
} from "./aimDecisionQueueEngine.js";
import type {
  AimStructuredDecisionInput
} from "./aimDecisionQueueContracts.js";
import { buildAimJournalPacket } from "./aimJournalEngine.js";
import { buildAimFixtureExportPacket } from "./aimFixtureEngine.js";
import { buildAimPreviewHarnessPacket } from "./aimPreviewEngine.js";
import {
  renderAimStaticPreviewPacket,
  verifyAimStaticBrowserPreview
} from "./aimStaticRendererEngine.js";
import type {
  AimManualEvidenceDraft,
  AimManualEvidenceFieldGroup,
  AimManualEvidenceIntakeScreenPacket,
  AimManualEvidenceIntakeValidation,
  AimOperatorEndToEndFlowPacket,
  AimOperatorWorkflowStatus
} from "./aimOperatorWorkflowContracts.js";
import type { AimFixtureRole } from "./aimFixtureContracts.js";

function stableIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 72) || "operator";
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);

  if (Array.isArray(value)) {
    return "[" + value.map((item) => stableStringify(item)).join(",") + "]";
  }

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

  return "aim_operator_hash_" + (hash >>> 0).toString(16).padStart(8, "0");
}

function freezeDeep<T>(value: T): Readonly<T> {
  if (value && typeof value === "object") {
    for (const key of Object.keys(value as Record<string, unknown>)) {
      const child = (value as Record<string, unknown>)[key];
      if (child && typeof child === "object" && !Object.isFrozen(child)) {
        freezeDeep(child);
      }
    }
    Object.freeze(value);
  }

  return value as Readonly<T>;
}

export function buildAimManualEvidenceFieldGroups(): AimManualEvidenceFieldGroup[] {
  return [
    {
      groupId: "source_context",
      title: "Source Context",
      required: true,
      fields: ["sourceType", "sourceInputs", "documentationRefs"]
    },
    {
      groupId: "signal_context",
      title: "Signal Context",
      required: true,
      fields: ["signalType", "assetOrSubject", "infrastructureLayer", "dependencyClaim"]
    },
    {
      groupId: "thesis_context",
      title: "Thesis Context",
      required: true,
      fields: ["thesisReference", "evidenceSummary", "operatorThesisNote"]
    },
    {
      groupId: "risk_context",
      title: "Risk Context",
      required: true,
      fields: ["evidenceStrength", "riskClass", "timingContext", "urgencyLevel", "contradictionFlags"]
    },
    {
      groupId: "review_context",
      title: "Review Context",
      required: true,
      fields: ["proposedAction", "nextStep"]
    }
  ];
}

export function validateAimManualEvidenceDraft(draft?: AimManualEvidenceDraft): AimManualEvidenceIntakeValidation {
  if (!draft) {
    return freezeDeep({
      status: "INTAKE_REFUSED_FOR_EMPTY_DRAFT",
      issues: ["EMPTY_DRAFT"],
      readyForFlow: false,
      prohibitedActionDetected: false,
      humanReviewRequired: true,
      finalAuthority: "Human",
      finalAction: ""
    }) as AimManualEvidenceIntakeValidation;
  }

  const issues: string[] = [];

  if (draft.draftId.trim().length === 0) issues.push("MISSING_DRAFT_ID");
  if (draft.createdAt.trim().length === 0) issues.push("MISSING_CREATED_AT");
  if (draft.sourceInputs.length === 0) issues.push("MISSING_SOURCE_INPUTS");
  if (draft.documentationRefs.length === 0) issues.push("MISSING_DOCUMENTATION_REFS");
  if (draft.assetOrSubject.trim().length === 0) issues.push("MISSING_ASSET_OR_SUBJECT");
  if (draft.thesisReference.trim().length === 0) issues.push("MISSING_THESIS_REFERENCE");
  if (draft.evidenceSummary.trim().length === 0) issues.push("MISSING_EVIDENCE_SUMMARY");
  if (draft.infrastructureLayer.trim().length === 0) issues.push("MISSING_INFRASTRUCTURE_LAYER");
  if (draft.dependencyClaim.trim().length === 0) issues.push("MISSING_DEPENDENCY_CLAIM");
  if (draft.operatorThesisNote.trim().length === 0) issues.push("MISSING_OPERATOR_THESIS_NOTE");
  if (draft.proposedAction.trim().length === 0) issues.push("MISSING_PROPOSED_ACTION");
  if (draft.nextStep.trim().length === 0) issues.push("MISSING_NEXT_STEP");

  const prohibitedActionDetected = containsProhibitedActionLanguage(draft.proposedAction);

  if (prohibitedActionDetected) {
    issues.push("PROHIBITED_ACTION_LANGUAGE");
  }

  const status =
    prohibitedActionDetected
      ? "INTAKE_REFUSED_FOR_PROHIBITED_ACTION"
      : issues.length > 0
        ? "INTAKE_HELD_FOR_REQUIRED_FIELDS"
        : "INTAKE_READY";

  return freezeDeep({
    status,
    issues,
    readyForFlow: status === "INTAKE_READY",
    prohibitedActionDetected,
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimManualEvidenceIntakeValidation;
}

export function buildAimManualEvidenceIntakeScreen(
  draft?: AimManualEvidenceDraft,
  createdAt = "2026-05-14T16:00:00.000Z"
): AimManualEvidenceIntakeScreenPacket {
  const validation = validateAimManualEvidenceDraft(draft);

  return freezeDeep({
    screenId: "aim_manual_intake_screen_" + stableIdPart(draft?.draftId || "empty"),
    createdAt,
    status: validation.status,
    title: "AIM Manual Evidence Intake",
    description: "Local-only structured intake state for manually supplied AIM research evidence. It prepares a governed decision flow without live data, execution, or financial advice.",
    fieldGroups: buildAimManualEvidenceFieldGroups(),
    validation,
    readOnlySchema: true,
    maySubmitToLocalFlow: validation.readyForFlow,
    mayMutateExistingRecords: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    finalAction: ""
  }) as AimManualEvidenceIntakeScreenPacket;
}

export function convertManualEvidenceDraftToStructuredDecisionInput(
  draft: AimManualEvidenceDraft
): AimStructuredDecisionInput {
  return {
    sourceInputs: [...draft.sourceInputs],
    departmentOrigin: draft.departmentOrigin,
    agentOrigin: draft.agentOrigin,
    signalType: draft.signalType,
    assetOrSubject: draft.assetOrSubject,
    thesisReference: draft.thesisReference,
    evidenceSummary: draft.evidenceSummary,
    evidenceStrength: draft.evidenceStrength,
    contradictionFlags: [...draft.contradictionFlags],
    riskClass: draft.riskClass,
    timingContext: draft.timingContext,
    urgencyLevel: draft.urgencyLevel,
    proposedAction: draft.proposedAction,
    documentationRefs: [...draft.documentationRefs],
    nextStep: draft.nextStep
  };
}

export function deriveAimOperatorWorkflowStatus(
  intakeScreen: AimManualEvidenceIntakeScreenPacket,
  browserStatus?: "BROWSER_STATIC_VERIFIED" | "BROWSER_STATIC_REFUSED"
): AimOperatorWorkflowStatus {
  if (!intakeScreen.validation.readyForFlow) return "FLOW_REFUSED_INPUT";
  if (browserStatus === "BROWSER_STATIC_REFUSED") return "FLOW_BROWSER_REFUSED";
  if (intakeScreen.status === "INTAKE_READY" && browserStatus === "BROWSER_STATIC_VERIFIED") return "FLOW_COMPLETED";
  return "FLOW_HELD_FOR_REVIEW";
}

export function buildAimOperatorEndToEndLocalFlow(
  draft: AimManualEvidenceDraft,
  role: AimFixtureRole = "operator",
  createdAt = "2026-05-14T16:10:00.000Z"
): AimOperatorEndToEndFlowPacket {
  const intakeScreen = buildAimManualEvidenceIntakeScreen(draft, createdAt);

  if (!intakeScreen.validation.readyForFlow) {
    return freezeDeep({
      flowId: "aim_operator_flow_" + stableIdPart(draft.draftId),
      createdAt,
      status: "FLOW_REFUSED_INPUT",
      sourceDraftId: draft.draftId,
      intakeScreen,
      flowHash: simpleDeterministicHash({
        sourceDraftId: draft.draftId,
        status: "FLOW_REFUSED_INPUT",
        issues: intakeScreen.validation.issues
      }),
      readOnly: true,
      deterministic: true,
      localOnly: true,
      mayUseLiveData: false,
      mayCallExternalApi: false,
      mayMutateState: false,
      mayExecuteTrade: false,
      mayApproveInvestment: false,
      mayProvideFinancialAdvice: false,
      mayWriteSoul: false,
      humanReviewRequired: true,
      finalAuthority: "Human",
      finalAction: ""
    }) as AimOperatorEndToEndFlowPacket;
  }

  const structuredDecisionInput = convertManualEvidenceDraftToStructuredDecisionInput(draft);
  const decisionItem = buildAimDecisionItem(structuredDecisionInput, createdAt);
  const journalPacket = buildAimJournalPacket(decisionItem, createdAt);
  const fixtureExport = buildAimFixtureExportPacket([decisionItem], [journalPacket], role, createdAt);
  const previewHarness = buildAimPreviewHarnessPacket(fixtureExport, role, createdAt);
  const staticRender = renderAimStaticPreviewPacket(previewHarness, createdAt);
  const browserVerification = verifyAimStaticBrowserPreview(staticRender, createdAt);
  const status = deriveAimOperatorWorkflowStatus(intakeScreen, browserVerification.status);

  return freezeDeep({
    flowId: "aim_operator_flow_" + stableIdPart(draft.draftId),
    createdAt,
    status,
    sourceDraftId: draft.draftId,
    intakeScreen,
    structuredDecisionInput,
    decisionItem,
    journalPacket,
    fixtureExport,
    previewHarness,
    staticRender,
    browserVerification,
    flowHash: simpleDeterministicHash({
      sourceDraftId: draft.draftId,
      decisionId: decisionItem.decisionId,
      journalPacketId: journalPacket.journalPacketId,
      exportHash: fixtureExport.exportHash,
      previewHash: previewHarness.previewHash,
      staticRenderId: staticRender.staticRenderId,
      browserVerificationStatus: browserVerification.status,
      status
    }),
    readOnly: true,
    deterministic: true,
    localOnly: true,
    mayUseLiveData: false,
    mayCallExternalApi: false,
    mayMutateState: false,
    mayExecuteTrade: false,
    mayApproveInvestment: false,
    mayProvideFinancialAdvice: false,
    mayWriteSoul: false,
    humanReviewRequired: true,
    finalAuthority: "Human",
    finalAction: ""
  }) as AimOperatorEndToEndFlowPacket;
}