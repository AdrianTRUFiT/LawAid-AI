import {
  AIOSWorkflowDefinition,
  AIOSWorkflowStage,
  AIOSWorkflowTransition,
  AIOSWorkflowValidationResult
} from "./aiosWorkflowContracts";

function id(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function hasStage(stages: AIOSWorkflowStage[], stageId: string) {
  return stages.some((stage) => stage.stageId === stageId);
}

function duplicateStageIds(stages: AIOSWorkflowStage[]) {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const stage of stages) {
    if (seen.has(stage.stageId)) duplicates.push(stage.stageId);
    seen.add(stage.stageId);
  }

  return duplicates;
}

function illegalTransitions(
  stages: AIOSWorkflowStage[],
  transitions: AIOSWorkflowTransition[]
) {
  return transitions.filter((transition) => {
    if (!transition.allowed) return false;
    return !hasStage(stages, transition.fromStageId) || !hasStage(stages, transition.toStageId);
  });
}

export function validateAIOSWorkflow(
  workflow: AIOSWorkflowDefinition
): AIOSWorkflowValidationResult {
  const blockedReasons: string[] = [];
  const missingRequiredStages: string[] = [];

  if (!workflow.workflowName) blockedReasons.push("WORKFLOW_NAME_REQUIRED");
  if (!workflow.summary) blockedReasons.push("WORKFLOW_SUMMARY_REQUIRED");
  if (!workflow.ownerModule) blockedReasons.push("OWNER_MODULE_REQUIRED");
  if (workflow.stages.length === 0) blockedReasons.push("WORKFLOW_STAGES_REQUIRED");
  if (workflow.transitions.length === 0) blockedReasons.push("WORKFLOW_TRANSITIONS_REQUIRED");

  const duplicates = duplicateStageIds(workflow.stages);
  if (duplicates.length > 0) blockedReasons.push("DUPLICATE_STAGE_IDS");

  const requiredTypes = ["capture", "review", "record"];
  for (const type of requiredTypes) {
    if (!workflow.stages.some((stage) => stage.stageType === type && stage.required)) {
      missingRequiredStages.push(type);
    }
  }

  if (missingRequiredStages.length > 0) blockedReasons.push("REQUIRED_STAGE_TYPES_MISSING");

  const badTransitions = illegalTransitions(workflow.stages, workflow.transitions);
  if (badTransitions.length > 0) blockedReasons.push("ILLEGAL_TRANSITIONS_PRESENT");

  if (workflow.status === "RETIRED") blockedReasons.push("RETIRED_WORKFLOW_NOT_VALID_FOR_REVIEW");
  if (workflow.status === "SUPERSEDED") blockedReasons.push("SUPERSEDED_WORKFLOW_NOT_VALID_FOR_REVIEW");

  const valid = blockedReasons.length === 0;

  return {
    validationId: id("aios-workflow-validation"),
    workflowId: workflow.workflowId,
    checkedAt: new Date().toISOString(),
    valid,
    blockedReasons,
    missingRequiredStages,
    illegalTransitions: badTransitions,
    nextAllowedStatus: valid ? "READY_FOR_REVIEW" : "RUNTIME_HELD",
    authorityBoundary: {
      ...workflow.authorityBoundary,
      validationIsNotExecution: true,
      validationIsNotActivation: true
    }
  };
}
