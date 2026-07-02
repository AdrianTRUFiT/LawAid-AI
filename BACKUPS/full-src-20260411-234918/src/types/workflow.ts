export type PostType =
  | "incoming-communication"
  | "draft-response"
  | "document-evidence"
  | "request-task"
  | "internal-note"
  | "filing-formal-draft";

export type RefinementState =
  | "posted"
  | "review"
  | "compare"
  | "consolidate"
  | "final-draft";

export type ActionState =
  | "in-progress"
  | "on-hold"
  | "waiting-for-approval"
  | "ready-but-held"
  | "ready-to-send"
  | "sent"
  | "awaiting-response";

export type TimingState =
  | "none"
  | "due-soon"
  | "action-needed"
  | "follow-up-now"
  | "deadline-risk"
  | "overdue";

export type OutboxType =
  | "none"
  | "email-draft"
  | "downloadable-document"
  | "copy-ready-response";

export interface WorkflowItem {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  postType: PostType;

  refinementState: RefinementState;
  actionState: ActionState;
  timingState: TimingState;
  outboxType: OutboxType;

  createdAt: string;
  updatedAt: string;
  dueAt?: string;
  holdReason?: string;
  nextRecommendedAction?: string;
  sourceRecordId?: string;
}