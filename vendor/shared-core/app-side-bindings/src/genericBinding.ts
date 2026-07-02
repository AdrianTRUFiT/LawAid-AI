import type { OperatorRouteResult } from "../../operator-routing-layer/src/index.js";
import type { AppBindingEnvelope, GenericBindingViewModel } from "./contracts.js";
import { validateRouteResultForBinding } from "./validators.js";

export function bindGenericView(
  result: OperatorRouteResult,
): AppBindingEnvelope<GenericBindingViewModel> {
  const validation = validateRouteResultForBinding(result);

  if (!validation.ok || !result.districtPacket || result.districtPacket.districtType !== "GENERIC") {
    return {
      appKey: "GENERIC",
      bound: false,
      reason: validation.reason,
      routeDecision: result.decision,
      packet: result.districtPacket,
      viewModel: {
        routeDecision: result.decision,
        routeReason: result.reason,
        active: false,
        sourceLiveRecordId: null,
        tags: [],
        displaySummary: result.reason,
      },
    };
  }

  const packet = result.districtPacket;

  return {
    appKey: "GENERIC",
    bound: true,
    reason: "Generic binding created.",
    routeDecision: result.decision,
    packet,
    viewModel: {
      routeDecision: result.decision,
      routeReason: result.reason,
      active: packet.domainState === "active",
      sourceLiveRecordId: packet.sourceLiveRecordId,
      tags: packet.tags,
      displaySummary: packet.summary,
    },
  };
}