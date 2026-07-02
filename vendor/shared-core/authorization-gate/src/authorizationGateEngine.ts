import { validateAuthorizationRequest } from "./authorizationGateRules.js";
import type {
  AuthorizationGateResponse,
  AuthorizationRequest,
  AuthorizationResult,
} from "./authorizationGateTypes.js";
import { authorizationRank, nowIso } from "./authorizationGateUtils.js";

export function evaluateAuthorization(
  request: AuthorizationRequest,
): AuthorizationGateResponse {
  const validation = validateAuthorizationRequest(request);

  if (!validation.ok) {
    return {
      ok: false,
      result: null,
      refusal: {
        refusalCode: validation.refusalCode!,
        refusalReason: validation.refusalReason!,
      },
    };
  }

  const provided = request.providedAuthorizationClass;

  if (!provided) {
    const result: AuthorizationResult = {
      requestId: request.requestId,
      actionType: request.actionType,
      targetType: request.targetType,
      targetId: request.targetId,
      requiredAuthorizationClass: request.requiredAuthorizationClass,
      providedAuthorizationClass: undefined,
      authorized: false,
      decision: request.requiredAuthorizationClass === "none" ? "APPROVED" : "ESCALATE",
      reason: request.requiredAuthorizationClass === "none"
        ? "No authorization required."
        : "Authorization missing. Escalation required.",
      escalationRequired: request.requiredAuthorizationClass !== "none",
      trace: {
        decidedAt: nowIso(),
        decidedBy: "authorization-gate",
        decision: request.requiredAuthorizationClass === "none" ? "APPROVED" : "ESCALATE",
        reason: request.requiredAuthorizationClass === "none"
          ? "No authorization required."
          : "Authorization missing. Escalation required.",
      },
    };

    if (request.requiredAuthorizationClass === "none") {
      return { ok: true, result, refusal: null };
    }

    return {
      ok: false,
      result,
      refusal: {
        refusalCode: "AUTHORIZATION_MISSING",
        refusalReason: "Authorization refused because no authorization was provided.",
      },
    };
  }

  const requiredRank = authorizationRank(request.requiredAuthorizationClass);
  const providedRank = authorizationRank(provided);

  if (providedRank < requiredRank) {
    const result: AuthorizationResult = {
      requestId: request.requestId,
      actionType: request.actionType,
      targetType: request.targetType,
      targetId: request.targetId,
      requiredAuthorizationClass: request.requiredAuthorizationClass,
      providedAuthorizationClass: provided,
      authorized: false,
      decision: "REFUSED",
      reason: "Provided authorization is insufficient.",
      escalationRequired: false,
      trace: {
        decidedAt: nowIso(),
        decidedBy: "authorization-gate",
        decision: "REFUSED",
        reason: "Provided authorization is insufficient.",
      },
    };

    return {
      ok: false,
      result,
      refusal: {
        refusalCode: "INSUFFICIENT_AUTHORIZATION",
        refusalReason: "Authorization refused because provided authorization is insufficient.",
      },
    };
  }

  const result: AuthorizationResult = {
    requestId: request.requestId,
    actionType: request.actionType,
    targetType: request.targetType,
    targetId: request.targetId,
    requiredAuthorizationClass: request.requiredAuthorizationClass,
    providedAuthorizationClass: provided,
    authorized: true,
    decision: "APPROVED",
    reason: "Authorization approved.",
    escalationRequired: false,
    trace: {
      decidedAt: nowIso(),
      decidedBy: "authorization-gate",
      decision: "APPROVED",
      reason: "Authorization approved.",
    },
  };

  return {
    ok: true,
    result,
    refusal: null,
  };
}