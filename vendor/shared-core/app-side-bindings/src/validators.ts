import type { OperatorRouteResult } from "../../operator-routing-layer/src/index.js";

export function validateRouteResultForBinding(
  result: OperatorRouteResult,
): { ok: boolean; reason: string } {
  if (!result.routed || !result.districtPacket) {
    return {
      ok: false,
      reason: result.reason,
    };
  }

  return {
    ok: true,
    reason: "Route result is bindable.",
  };
}