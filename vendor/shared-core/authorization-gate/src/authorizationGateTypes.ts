export type AuthorizationClass =
  | "none"
  | "operator"
  | "supervisor"
  | "system_admin"
  | "compliance";

export type AuthorizationDecision =
  | "APPROVED"
  | "REFUSED"
  | "ESCALATE";

export interface AuthorizationRequest {
  requestId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  requestedBy: string;
  requiredAuthorizationClass: AuthorizationClass;
  providedAuthorizationClass?: AuthorizationClass;
  context?: Record<string, string>;
}

export interface AuthorizationTrace {
  decidedAt: string;
  decidedBy: string;
  decision: AuthorizationDecision;
  reason: string;
}

export interface AuthorizationResult {
  requestId: string;
  actionType: string;
  targetType: string;
  targetId: string;
  requiredAuthorizationClass: AuthorizationClass;
  providedAuthorizationClass?: AuthorizationClass;
  authorized: boolean;
  decision: AuthorizationDecision;
  reason: string;
  escalationRequired: boolean;
  trace: AuthorizationTrace;
}

export interface AuthorizationRefusal {
  refusalCode:
    | "INSUFFICIENT_AUTHORIZATION"
    | "AUTHORIZATION_MISSING"
    | "INVALID_ACTION"
    | "INVALID_TARGET";
  refusalReason: string;
}

export interface AuthorizationGateResponse {
  ok: boolean;
  result: AuthorizationResult | null;
  refusal: AuthorizationRefusal | null;
}