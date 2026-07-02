import {
  AIOSWorkflowAuthorityBoundary,
  AIOSWorkflowDefinition,
  AIOSWorkflowKind,
  AIOSWorkflowPriority,
  AIOSWorkflowStage,
  AIOSWorkflowStatus,
  AIOSWorkflowTransition
} from "./aiosWorkflowContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function defaultAIOSWorkflowBoundary(): AIOSWorkflowAuthorityBoundary {
  return {
    workflowRegistryIsNotExecution: true,
    workflowRegistryIsNotActivation: true,
    workflowRegistryIsNotAuthority: true,
    workflowRegistryIsNotCompletedArtifact: true,
    workflowRegistrationDoesNotMutateRuntime: true,
    runtimeUseRequiresAuthorizedApproval: true
  };
}

export function createAIOSWorkflowDefinition(input: {
  workflowName: string;
  workflowKind: AIOSWorkflowKind;
  summary: string;
  status?: AIOSWorkflowStatus;
  priority?: AIOSWorkflowPriority;
  ownerModule: string;
  relatedModules?: string[];
  stages?: AIOSWorkflowStage[];
  transitions?: AIOSWorkflowTransition[];
  dependencies?: string[];
  runtimeTrigger?: string;
}): AIOSWorkflowDefinition {
  const now = new Date().toISOString();

  return {
    workflowId: id("aios-workflow"),
    workflowName: input.workflowName.trim(),
    workflowKind: input.workflowKind,
    summary: input.summary.trim(),
    status: input.status || "DRAFT",
    priority: input.priority || "MEDIUM",
    ownerModule: input.ownerModule.trim(),
    relatedModules: input.relatedModules || [],
    stages: input.stages || [],
    transitions: input.transitions || [],
    dependencies: input.dependencies || [],
    runtimeTrigger: input.runtimeTrigger,
    createdAt: now,
    updatedAt: now,
    authorityBoundary: defaultAIOSWorkflowBoundary()
  };
}

export function updateAIOSWorkflowStatus(
  workflow: AIOSWorkflowDefinition,
  status: AIOSWorkflowStatus
): AIOSWorkflowDefinition {
  return {
    ...workflow,
    status,
    updatedAt: new Date().toISOString()
  };
}
