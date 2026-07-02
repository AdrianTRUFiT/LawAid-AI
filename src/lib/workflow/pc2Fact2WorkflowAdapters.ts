import { processPc2, processFact2 } from "../../../node_modules/@aiva/shared-kernel/dist/index.js";

export function createPc2WorkflowItem(description: string) {
  return processPc2({
    sourceDomain: "lawaidai",
    description,
    targetModule: "lawaidai-workflow",
    targetFiles: []
  });
}

export function createFact2WorkflowRefinement(description: string) {
  return processFact2({
    sourceDomain: "lawaidai",
    failureType: "workflow_friction",
    description,
    changedFiles: [],
    verificationMethod: ["operator_review"]
  });
}
