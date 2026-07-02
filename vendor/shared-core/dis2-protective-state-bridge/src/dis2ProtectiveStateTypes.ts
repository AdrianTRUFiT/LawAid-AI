export type Dis2ProtectiveState =
  | "PROTECTED"
  | "UNDER_REVIEW"
  | "DELAYED_FOR_SAFETY"
  | "RESTORED"
  | "ACTIVE"
  | "BLOCKED";

export interface ProtectedFlowInputRecord {
  flowId: string;
  subjectId: string;
  checkpointHealth: "healthy" | "swollen" | "blocked" | "restored";
  protectedChannelState: "open" | "watch" | "held" | "restored" | "blocked";
  restorationPlanned: boolean;
  reason: string;
  createdAt: string;
}

export interface Dis2ProtectiveStateInput {
  subjectId: string;
  protectedFlow: ProtectedFlowInputRecord;
}

export interface Dis2ProtectiveStateArtifact {
  protectiveStateId: string;
  subjectId: string;
  sourceFlowId: string;
  protectiveState: Dis2ProtectiveState;
  reviewRequired: boolean;
  restorationVisible: boolean;
  reason: string;
  createdAt: string;
}

export interface Dis2ProtectiveStateRefusal {
  refusalCode:
    | "MISSING_PROTECTED_FLOW"
    | "SUBJECT_MISMATCH"
    | "MALFORMED_PROTECTED_FLOW";
  refusalReason: string;
}

export interface Dis2ProtectiveStateResult {
  ok: boolean;
  artifact: Dis2ProtectiveStateArtifact | null;
  refusal: Dis2ProtectiveStateRefusal | null;
}