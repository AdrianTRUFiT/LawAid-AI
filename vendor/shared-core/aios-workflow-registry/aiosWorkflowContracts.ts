export type AIOSWorkflowStatus =
  | "DRAFT"
  | "READY_FOR_REVIEW"
  | "APPROVED_FOR_RUNTIME"
  | "RUNTIME_HELD"
  | "ACTIVE"
  | "RETIRED"
  | "SUPERSEDED";

export type AIOSWorkflowKind =
  | "intake"
  | "review"
  | "activation"
  | "handoff"
  | "routing"
  | "evidence"
  | "action"
  | "operator"
  | "other";

export type AIOSWorkflowPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type AIOSWorkflowAuthorityBoundary = {
  workflowRegistryIsNotExecution: true;
  workflowRegistryIsNotActivation: true;
  workflowRegistryIsNotAuthority: true;
  workflowRegistryIsNotCompletedArtifact: true;
  workflowRegistrationDoesNotMutateRuntime: true;
  runtimeUseRequiresAuthorizedApproval: true;
};

export type AIOSWorkflowStage = {
  stageId: string;
  label: string;
  description: string;
  stageType:
    | "capture"
    | "structure"
    | "review"
    | "verify"
    | "route"
    | "activate"
    | "record"
    | "close"
    | "other";
  requiredArtifact?: string;
  emitsArtifact?: string;
  required: boolean;
};

export type AIOSWorkflowTransition = {
  transitionId: string;
  fromStageId: string;
  toStageId: string;
  requiredArtifact?: string;
  allowed: boolean;
  refusalReason?: string;
};

export type AIOSWorkflowDefinition = {
  workflowId: string;
  workflowName: string;
  workflowKind: AIOSWorkflowKind;
  summary: string;
  status: AIOSWorkflowStatus;
  priority: AIOSWorkflowPriority;
  ownerModule: string;
  relatedModules: string[];
  stages: AIOSWorkflowStage[];
  transitions: AIOSWorkflowTransition[];
  dependencies: string[];
  runtimeTrigger?: string;
  createdAt: string;
  updatedAt: string;
  authorityBoundary: AIOSWorkflowAuthorityBoundary;
};

export type AIOSWorkflowValidationResult = {
  validationId: string;
  workflowId: string;
  checkedAt: string;
  valid: boolean;
  blockedReasons: string[];
  missingRequiredStages: string[];
  illegalTransitions: AIOSWorkflowTransition[];
  nextAllowedStatus:
    | "READY_FOR_REVIEW"
    | "RUNTIME_HELD"
    | "NO_STATUS_CHANGE";
  authorityBoundary: AIOSWorkflowAuthorityBoundary & {
    validationIsNotExecution: true;
    validationIsNotActivation: true;
  };
};

export type AIOSWorkflowRuntimeGuardResult = {
  runtimeGuardId: string;
  workflowId: string;
  checkedAt: string;
  allowed: boolean;
  reason:
    | "APPROVED_WORKFLOW_CAN_SURFACE_FOR_RUNTIME"
    | "DRAFT_WORKFLOW_CANNOT_RUN"
    | "REVIEW_WORKFLOW_CANNOT_RUN"
    | "HELD_WORKFLOW_CANNOT_RUN"
    | "RETIRED_WORKFLOW_CANNOT_RUN"
    | "SUPERSEDED_WORKFLOW_CANNOT_RUN"
    | "WORKFLOW_NOT_APPROVED_FOR_RUNTIME";
  requiredCorrections: string[];
  authorityBoundary: AIOSWorkflowAuthorityBoundary & {
    runtimeGuardIsNotExecution: true;
    runtimeGuardIsNotActivation: true;
  };
};

export type AIOSWorkflowLedgerEntry = {
  ledgerEntryId: string;
  createdAt: string;
  eventType:
    | "WORKFLOW_REGISTERED"
    | "WORKFLOW_VALIDATED"
    | "RUNTIME_GUARD_CHECKED";
  workflowId: string;
  status: AIOSWorkflowStatus;
  ledgerPath: string;
  notes: string[];
};
