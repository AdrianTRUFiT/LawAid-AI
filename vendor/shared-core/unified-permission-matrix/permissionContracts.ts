export type ActorLane =
  | "HARD"
  | "PING"
  | "PONG"
  | "MARK"
  | "AUTHORIZED_HUMAN"
  | "EXTERNAL_LLM"
  | "FRONTEND_SURFACE"
  | "BACKEND_MODULE";

export type PermissionDecision =
  | "ALLOW"
  | "REFUSE"
  | "READ_ONLY"
  | "REVIEW_REQUIRED";

export type PermissionAction =
  | "read_verified_state"
  | "write_development_artifact"
  | "write_authoritative_record"
  | "mutate_sealed_record"
  | "create_authority"
  | "route_execution"
  | "review_acceptance"
  | "security_refusal"
  | "surface_backend_state"
  | "request_action"
  | "display_status"
  | "trigger_consequence";

export type PermissionContext = {
  actor: ActorLane;
  role?: string;
  action: PermissionAction;
  target: string;
  backendVerified?: boolean;
  sealed?: boolean;
  humanApproved?: boolean;
  surfaceReadOnly?: boolean;
};

export type PermissionResult = {
  decision: PermissionDecision;
  reason: string;
};
