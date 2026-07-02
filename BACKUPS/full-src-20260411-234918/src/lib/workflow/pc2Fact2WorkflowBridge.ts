import { createPc2WorkflowItem, createFact2WorkflowRefinement } from "./pc2Fact2WorkflowAdapters";

export function buildWorkflowPc2Record(description: string) {
  return createPc2WorkflowItem(description);
}

export function buildWorkflowFact2Record(description: string) {
  return createFact2WorkflowRefinement(description);
}
