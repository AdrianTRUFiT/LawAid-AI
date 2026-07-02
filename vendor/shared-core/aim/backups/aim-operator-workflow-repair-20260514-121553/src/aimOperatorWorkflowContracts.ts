import type {
  AimAgentOrigin,
  AimDepartmentOrigin,
  AimDecisionItem,
  AimDecisionSignalType,
  AimEvidenceStrength,
  AimRiskClass,
  AimStructuredDecisionInput,
  AimTimingContext,
  AimUrgencyLevel
} from "./aimDecisionQueueContracts.js";
import type { AimJournalPacket } from "./aimJournalContracts.js";
import type { AimFixtureExportPacket, AimFixtureRole } from "./aimFixtureContracts.js";
import type { AimPreviewHarnessPacket } from "./aimPreviewContracts.js";
import type {
  AimStaticBrowserVerificationPacket,
  AimStaticPreviewRenderPacket
} from "./aimStaticRendererContracts.js";

export type AimManualEvidenceSourceType =
  | "public filing"
  | "company announcement"
  | "reputable report"
  | "industry inference"
  | "speculation"
  | "rumor";

export type AimManualEvidenceIntakeStatus =
  | "INTAKE_READY"
  | "INTAKE_HELD_FOR_REQUIRED_FIELDS"
  | "INTAKE_REFUSED_FOR_PROHIBITED_ACTION"
  | "INTAKE_REFUSED_FOR_EMPTY_DRAFT";

export type AimOperatorWorkflowStatus =
  | "FLOW_COMPLETED"
  | "FLOW_HELD_FOR_REVIEW"
  | "FLOW_REFUSED_INPUT"
  | "FLOW_BROWSER_REFUSED";

export interface AimManualEvidenceDraft {
  draftId: string;
  createdAt: string;
  sourceType: AimManualEvidenceSourceType;
  sourceInputs: string[];
  documentationRefs: string[];
  departmentOrigin: AimDepartmentOrigin;
  agentOrigin: AimAgentOrigin;
  signalType: AimDecisionSignalType;
  assetOrSubject: string;
  thesisReference: string;
  evidenceSummary: string;
  evidenceStrength: AimEvidenceStrength;
  contradictionFlags: string[];
  riskClass: AimRiskClass;
  timingContext: AimTimingContext;
  urgencyLevel: AimUrgencyLevel;
  proposedAction: string;
  nextStep: string;
  infrastructureLayer: string;
  dependencyClaim: string;
  operatorThesisNote: string;
  operatorContradictionNote: string;
}

export interface AimManualEvidenceFieldGroup {
  groupId: string;
  title: string;
  required: boolean;
  fields: string[];
}

export interface AimManualEvidenceIntakeValidation {
  status: AimManualEvidenceIntakeStatus;
  issues: string[];
  readyForFlow: boolean;
  prohibitedActionDetected: boolean;
  humanReviewRequired: true;
  finalAuthority: "Human";
  finalAction: "";
}

export interface AimManualEvidenceIntakeScreenPacket {
  screenId: string;
  createdAt: string;
  status: AimManualEvidenceIntakeStatus;
  title: "AIM Manual Evidence Intake";
  description: string;
  fieldGroups: readonly AimManualEvidenceFieldGroup[];
  validation: AimManualEvidenceIntakeValidation;
  readOnlySchema: true;
  maySubmitToLocalFlow: boolean;
  mayMutateExistingRecords: false;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  mayWriteSoul: false;
  finalAction: "";
}

export interface AimOperatorEndToEndFlowPacket {
  flowId: string;
  createdAt: string;
  status: AimOperatorWorkflowStatus;
  sourceDraftId: string;
  intakeScreen: AimManualEvidenceIntakeScreenPacket;
  structuredDecisionInput?: AimStructuredDecisionInput;
  decisionItem?: AimDecisionItem;
  journalPacket?: AimJournalPacket;
  fixtureExport?: AimFixtureExportPacket;
  previewHarness?: AimPreviewHarnessPacket;
  staticRender?: AimStaticPreviewRenderPacket;
  browserVerification?: AimStaticBrowserVerificationPacket;
  flowHash: string;
  readOnly: true;
  deterministic: true;
  localOnly: true;
  mayUseLiveData: false;
  mayCallExternalApi: false;
  mayMutateState: false;
  mayExecuteTrade: false;
  mayApproveInvestment: false;
  mayProvideFinancialAdvice: false;
  mayWriteSoul: false;
  humanReviewRequired: true;
  finalAuthority: "Human";
  finalAction: "";
}