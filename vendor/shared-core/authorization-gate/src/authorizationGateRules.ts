import type { AuthorizationRequest } from "./authorizationGateTypes.js";

export function validateAuthorizationRequest(
  request: AuthorizationRequest,
): { ok: boolean; refusalCode?: "INVALID_ACTION" | "INVALID_TARGET"; refusalReason?: string } {
  if (!request.actionType || request.actionType.trim() === "") {
    return {
      ok: false,
      refusalCode: "INVALID_ACTION",
      refusalReason: "Authorization refused because actionType is invalid.",
    };
  }

  if (!request.targetType || !request.targetId || request.targetType.trim() === "" || request.targetId.trim() === "") {
    return {
      ok: false,
      refusalCode: "INVALID_TARGET",
      refusalReason: "Authorization refused because targetType or targetId is invalid.",
    };
  }

  return { ok: true };
}