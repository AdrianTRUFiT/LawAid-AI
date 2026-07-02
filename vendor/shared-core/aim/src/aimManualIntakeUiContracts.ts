import type {
  AimManualEvidenceDraft,
  AimManualEvidenceIntakeScreenPacket,
  AimManualEvidenceIntakeStatus
} from "./aimOperatorWorkflowContracts.js";

export type AimManualIntakeUiStatus =
  | "INTAKE_UI_READY"
  | "INTAKE_UI_HELD"
  | "INTAKE_UI_REFUSED";

export type AimManualIntakeUiFieldKind =
  | "text"
  | "textarea"
  | "select"
  | "list"
  | "readonly";

export interface AimManualIntakeUiField {
  fieldId: string;
  label: string;
  kind: AimManualIntakeUiFieldKind;
  required: boolean;
  value: string | string[];
  placeholder: string;
  sourceDraftField: keyof AimManualEvidenceDraft;
  readOnlyExistingTruth: true;
  mayMutateVerifiedAimOutput: false;
  mayMutateJournal: false;
}

export interface AimManualIntakeUiSection {
  sectionId: string;
  title: string;
  description: string;
  statusLabel: string;
  fields: readonly AimManualIntakeUiField[];
  readOnlySchema: true;
  mayMutateVerifiedAimOutput: false;
  mayMutateJournal: false;
}

export interface AimManualIntakeUiPacket {
  uiId: string;
  createdAt: string;
  title: "AIM Manual Evidence Intake";
  subtitle: string;
  sourceDraftId: string;
  intakeStatus: AimManualEvidenceIntakeStatus;
  uiStatus: AimManualIntakeUiStatus;
  intakeScreen: AimManualEvidenceIntakeScreenPacket;
  sections: readonly AimManualIntakeUiSection[];
  sectionCount: number;
  htmlPreview: string;
  uiHash: string;
  readOnlySchema: true;
  controlledInputOnly: true;
  localOnly: true;
  mayPrepareDraftPayload: boolean;
  maySubmitToLocalFlow: boolean;
  mayMutateVerifiedAimOutput: false;
  mayMutateJournal: false;
  mayCreateTruth: false;
  mayGovern: false;
  mayApproveDecision: false;
  mayExecuteTrade: false;
  mayProvideFinancialAdvice: false;
  mayUseLiveData: false;
  mayCallExternalApi: false;
  humanReviewRequired: true;
  finalAuthority: "Human";
  finalAction: "";
}

export interface AimManualIntakeDraftPayloadPacket {
  payloadId: string;
  createdAt: string;
  sourceUiId: string;
  draft: AimManualEvidenceDraft;
  validationStatus: AimManualEvidenceIntakeStatus;
  readyForLocalFlow: boolean;
  payloadHash: string;
  localOnly: true;
  mayMutateVerifiedAimOutput: false;
  mayMutateJournal: false;
  mayExecuteTrade: false;
  mayApproveDecision: false;
  mayProvideFinancialAdvice: false;
  mayUseLiveData: false;
  mayCallExternalApi: false;
  finalAuthority: "Human";
  finalAction: "";
}

export interface AimManualIntakeUiGovernancePacket {
  governanceId: string;
  createdAt: string;
  sourceUiId: string;
  checks: Record<string, boolean>;
  status: "INTAKE_UI_GOVERNANCE_VERIFIED" | "INTAKE_UI_GOVERNANCE_REFUSED";
  refusalReasons: string[];
  finalAuthority: "Human";
  finalAction: "";
}