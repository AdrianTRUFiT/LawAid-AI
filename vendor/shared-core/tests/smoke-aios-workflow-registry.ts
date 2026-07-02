import fs from "fs";
import {
  checkAIOSWorkflowRuntimeGuard,
  createAIOSWorkflowDefinition,
  getAIOSWorkflowLedgerPath,
  recordAIOSWorkflowRegistered,
  recordAIOSWorkflowRuntimeGuard,
  recordAIOSWorkflowValidated,
  updateAIOSWorkflowStatus,
  validateAIOSWorkflow
} from "../aios-workflow-registry";

function assert(condition: boolean, label: string) {
  if (!condition) throw new Error("ASSERTION_FAILED: " + label);
  console.log("PASS:", label);
}

const workflow = createAIOSWorkflowDefinition({
  workflowName: "LawAidAI Receiving Review Workflow",
  workflowKind: "review",
  summary: "Defines a bounded AIOS workflow for LawAidAI receiving-to-review movement without executing it.",
  status: "DRAFT",
  priority: "HIGH",
  ownerModule: "LawAidAI",
  relatedModules: ["HIC", "LawAidAI Receiving", "LawAidAI Review"],
  stages: [
    {
      stageId: "capture-receiving-input",
      label: "Capture Receiving Input",
      description: "Capture a governed receiving input packet.",
      stageType: "capture",
      requiredArtifact: "LawAidAIReceivingInputPacket",
      emitsArtifact: "CapturedReceivingInput",
      required: true
    },
    {
      stageId: "review-eligibility",
      label: "Review Eligibility",
      description: "Check whether receiving input is eligible for governed interpretation.",
      stageType: "review",
      requiredArtifact: "CapturedReceivingInput",
      emitsArtifact: "LawAidAIReviewPacket",
      required: true
    },
    {
      stageId: "record-review-state",
      label: "Record Review State",
      description: "Record review state without creating evidence, action, or authority.",
      stageType: "record",
      requiredArtifact: "LawAidAIReviewPacket",
      emitsArtifact: "ReviewLedgerEntry",
      required: true
    }
  ],
  transitions: [
    {
      transitionId: "capture-to-review",
      fromStageId: "capture-receiving-input",
      toStageId: "review-eligibility",
      requiredArtifact: "CapturedReceivingInput",
      allowed: true
    },
    {
      transitionId: "review-to-record",
      fromStageId: "review-eligibility",
      toStageId: "record-review-state",
      requiredArtifact: "LawAidAIReviewPacket",
      allowed: true
    }
  ],
  dependencies: ["HIC-4 Receiving-to-Review Gate"],
  runtimeTrigger: "Authorized operator review flow"
});

recordAIOSWorkflowRegistered(workflow);

assert(workflow.authorityBoundary.workflowRegistryIsNotExecution === true, "Workflow registry is not execution");
assert(workflow.authorityBoundary.workflowRegistryIsNotActivation === true, "Workflow registry is not activation");
assert(workflow.authorityBoundary.workflowRegistryIsNotAuthority === true, "Workflow registry is not authority");
assert(workflow.authorityBoundary.workflowRegistryIsNotCompletedArtifact === true, "Workflow registry is not completed artifact");

const validation = validateAIOSWorkflow(workflow);
recordAIOSWorkflowValidated(workflow, validation);

assert(validation.valid === true, "Valid workflow definition passes validation");
assert(validation.nextAllowedStatus === "READY_FOR_REVIEW", "Valid workflow can move to review-ready");
assert(validation.authorityBoundary.validationIsNotExecution === true, "Validation is not execution");
assert(validation.authorityBoundary.validationIsNotActivation === true, "Validation is not activation");

const draftRuntime = checkAIOSWorkflowRuntimeGuard(workflow);
recordAIOSWorkflowRuntimeGuard(workflow, draftRuntime);

assert(draftRuntime.allowed === false, "Draft workflow cannot run");
assert(draftRuntime.reason === "DRAFT_WORKFLOW_CANNOT_RUN", "Draft runtime refusal reason is correct");

const approvedWorkflow = updateAIOSWorkflowStatus(workflow, "APPROVED_FOR_RUNTIME");
const approvedRuntime = checkAIOSWorkflowRuntimeGuard(approvedWorkflow);
recordAIOSWorkflowRuntimeGuard(approvedWorkflow, approvedRuntime);

assert(approvedRuntime.allowed === true, "Approved workflow can surface for runtime");
assert(approvedRuntime.reason === "APPROVED_WORKFLOW_CAN_SURFACE_FOR_RUNTIME", "Approved runtime reason is correct");
assert(approvedRuntime.authorityBoundary.runtimeGuardIsNotExecution === true, "Runtime guard is not execution");
assert(approvedRuntime.authorityBoundary.runtimeGuardIsNotActivation === true, "Runtime guard is not activation");

const supersededWorkflow = updateAIOSWorkflowStatus(workflow, "SUPERSEDED");
const supersededRuntime = checkAIOSWorkflowRuntimeGuard(supersededWorkflow);
recordAIOSWorkflowRuntimeGuard(supersededWorkflow, supersededRuntime);

assert(supersededRuntime.allowed === false, "Superseded workflow cannot run");
assert(supersededRuntime.reason === "SUPERSEDED_WORKFLOW_CANNOT_RUN", "Superseded runtime refusal reason is correct");

const invalidWorkflow = createAIOSWorkflowDefinition({
  workflowName: "Invalid Workflow",
  workflowKind: "handoff",
  summary: "Invalid workflow should be held.",
  status: "DRAFT",
  ownerModule: "",
  stages: [
    {
      stageId: "capture-only",
      label: "Capture Only",
      description: "Missing review and record stages.",
      stageType: "capture",
      required: true
    }
  ],
  transitions: [
    {
      transitionId: "bad-transition",
      fromStageId: "capture-only",
      toStageId: "missing-stage",
      allowed: true
    }
  ],
  dependencies: []
});

const invalidValidation = validateAIOSWorkflow(invalidWorkflow);
recordAIOSWorkflowValidated(invalidWorkflow, invalidValidation);

assert(invalidValidation.valid === false, "Invalid workflow fails validation");
assert(invalidValidation.blockedReasons.includes("OWNER_MODULE_REQUIRED"), "Invalid workflow requires owner module");
assert(invalidValidation.blockedReasons.includes("REQUIRED_STAGE_TYPES_MISSING"), "Invalid workflow detects missing required stage types");
assert(invalidValidation.blockedReasons.includes("ILLEGAL_TRANSITIONS_PRESENT"), "Invalid workflow detects illegal transition");

const ledgerPath = getAIOSWorkflowLedgerPath();
assert(fs.existsSync(ledgerPath), "AIOS workflow ledger writes");
assert(fs.readFileSync(ledgerPath, "utf8").trim().length > 0, "AIOS workflow ledger contains entries");

console.log("");
console.log("AIOS_WORKFLOW_REGISTRY_SMOKE=PASS");









