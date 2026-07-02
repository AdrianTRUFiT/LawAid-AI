export type LifecycleState =
  | "PROSPECT"
  | "IDENTIFIED"
  | "OFFERED"
  | "PENDING_ACCEPTANCE"
  | "ACTIVE_TRIAL"
  | "ACTIVE_PAID"
  | "GRACE"
  | "PAST_DUE"
  | "DOWNGRADED"
  | "PAUSED"
  | "CANCELED_PERIOD_END"
  | "ARCHIVED"
  | "EXPIRED"
  | "REACTIVATED"
  | "REQUESTOR_FUNDED";

export interface LifecycleRegistryInput {
  subjectId: string;
  currentState: LifecycleState;
  requestedState: LifecycleState;
  sourceEvent?: string;
  reason?: string;
}

export interface LifecycleRegistryArtifact {
  lifecycleEventId: string;
  subjectId: string;
  previousState: LifecycleState;
  nextState: LifecycleState;
  transitionAccepted: boolean;
  sourceEvent: string | null;
  reason: string;
  createdAt: string;
}

export interface LifecycleRegistryRefusal {
  refusalCode:
    | "INVALID_TRANSITION"
    | "SUBJECT_MISSING";
  refusalReason: string;
}

export interface LifecycleRegistryResult {
  ok: boolean;
  artifact: LifecycleRegistryArtifact | null;
  refusal: LifecycleRegistryRefusal | null;
}