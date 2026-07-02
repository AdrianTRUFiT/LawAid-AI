import {
  AIOSWorkflowDefinition,
  AIOSWorkflowRuntimeGuardResult
} from "./aiosWorkflowContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function checkAIOSWorkflowRuntimeGuard(
  workflow: AIOSWorkflowDefinition
): AIOSWorkflowRuntimeGuardResult {
  const boundary = {
    ...workflow.authorityBoundary,
    runtimeGuardIsNotExecution: true as const,
    runtimeGuardIsNotActivation: true as const
  };

  if (workflow.status === "DRAFT") {
    return {
      runtimeGuardId: id("aios-runtime-guard"),
      workflowId: workflow.workflowId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "DRAFT_WORKFLOW_CANNOT_RUN",
      requiredCorrections: ["MOVE_WORKFLOW_TO_REVIEW_AND_APPROVAL_BEFORE_RUNTIME"],
      authorityBoundary: boundary
    };
  }

  if (workflow.status === "READY_FOR_REVIEW") {
    return {
      runtimeGuardId: id("aios-runtime-guard"),
      workflowId: workflow.workflowId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "REVIEW_WORKFLOW_CANNOT_RUN",
      requiredCorrections: ["AUTHORIZED_RUNTIME_APPROVAL_REQUIRED"],
      authorityBoundary: boundary
    };
  }

  if (workflow.status === "RUNTIME_HELD") {
    return {
      runtimeGuardId: id("aios-runtime-guard"),
      workflowId: workflow.workflowId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "HELD_WORKFLOW_CANNOT_RUN",
      requiredCorrections: ["RESOLVE_RUNTIME_HOLD_BEFORE_RUNTIME"],
      authorityBoundary: boundary
    };
  }

  if (workflow.status === "RETIRED") {
    return {
      runtimeGuardId: id("aios-runtime-guard"),
      workflowId: workflow.workflowId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "RETIRED_WORKFLOW_CANNOT_RUN",
      requiredCorrections: ["CREATE_OR_SELECT_CURRENT_WORKFLOW"],
      authorityBoundary: boundary
    };
  }

  if (workflow.status === "SUPERSEDED") {
    return {
      runtimeGuardId: id("aios-runtime-guard"),
      workflowId: workflow.workflowId,
      checkedAt: new Date().toISOString(),
      allowed: false,
      reason: "SUPERSEDED_WORKFLOW_CANNOT_RUN",
      requiredCorrections: ["USE_CURRENT_WORKFLOW_DEFINITION"],
      authorityBoundary: boundary
    };
  }

  if (workflow.status === "APPROVED_FOR_RUNTIME") {
    return {
      runtimeGuardId: id("aios-runtime-guard"),
      workflowId: workflow.workflowId,
      checkedAt: new Date().toISOString(),
      allowed: true,
      reason: "APPROVED_WORKFLOW_CAN_SURFACE_FOR_RUNTIME",
      requiredCorrections: [],
      authorityBoundary: boundary
    };
  }

  return {
    runtimeGuardId: id("aios-runtime-guard"),
    workflowId: workflow.workflowId,
    checkedAt: new Date().toISOString(),
    allowed: false,
    reason: "WORKFLOW_NOT_APPROVED_FOR_RUNTIME",
    requiredCorrections: ["APPROVED_FOR_RUNTIME_STATUS_REQUIRED"],
    authorityBoundary: boundary
  };
}
