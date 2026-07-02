import type {
  WorkflowItem,
  PostType,
  RefinementState,
  ActionState,
  OutboxType,
} from "../../types/workflow";

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(): string {
  return `wf-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function createWorkflowItem(input: {
  projectId: string;
  title: string;
  description?: string;
  postType: PostType;
  dueAt?: string;
  sourceRecordId?: string;
}): WorkflowItem {
  return {
    id: makeId(),
    projectId: input.projectId,
    title: input.title,
    description: input.description,
    postType: input.postType,
    refinementState: "posted",
    actionState: "in-progress",
    timingState: "none",
    outboxType: "none",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    dueAt: input.dueAt,
    sourceRecordId: input.sourceRecordId,
    nextRecommendedAction: "Review this item.",
  };
}

export function setRefinementState(
  item: WorkflowItem,
  refinementState: RefinementState,
): WorkflowItem {
  const next = { ...item, refinementState, updatedAt: nowIso() };

  switch (refinementState) {
    case "posted":
      next.nextRecommendedAction = "Start review.";
      break;
    case "review":
      next.nextRecommendedAction = "Compare options or perspectives.";
      break;
    case "compare":
      next.nextRecommendedAction = "Consolidate the strongest version.";
      break;
    case "consolidate":
      next.nextRecommendedAction = "Finalize the draft.";
      break;
    case "final-draft":
      next.nextRecommendedAction = "Choose the next action state.";
      break;
  }

  return next;
}

export function setActionState(
  item: WorkflowItem,
  actionState: ActionState,
  holdReason?: string,
): WorkflowItem {
  const next = {
    ...item,
    actionState,
    updatedAt: nowIso(),
    holdReason: holdReason ?? item.holdReason,
  };

  switch (actionState) {
    case "in-progress":
      next.nextRecommendedAction = "Continue refinement.";
      break;
    case "on-hold":
      next.nextRecommendedAction = "Resume when more information is available.";
      break;
    case "waiting-for-approval":
      next.nextRecommendedAction = "Follow up for approval if no response arrives.";
      break;
    case "ready-but-held":
      next.nextRecommendedAction = "Send when timing is right.";
      break;
    case "ready-to-send":
      next.nextRecommendedAction = "Move this into assisted outbox.";
      break;
    case "sent":
      next.nextRecommendedAction = "Watch for response.";
      break;
    case "awaiting-response":
      next.nextRecommendedAction = "Follow up if response window passes.";
      break;
  }

  return next;
}

export function setOutboxType(
  item: WorkflowItem,
  outboxType: OutboxType,
): WorkflowItem {
  const next = { ...item, outboxType, updatedAt: nowIso() };

  if (outboxType === "email-draft") {
    next.nextRecommendedAction = "Review the email draft before send.";
  } else if (outboxType === "downloadable-document") {
    next.nextRecommendedAction = "Download and review the document.";
  } else if (outboxType === "copy-ready-response") {
    next.nextRecommendedAction = "Copy response into the target channel.";
  }

  return next;
}
