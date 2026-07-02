import type { OperatorRouteResult } from "../../operator-routing-layer/src/index.js";
import type { AppBindingEnvelope, TravelFlowBindingViewModel } from "./contracts.js";
import { validateRouteResultForBinding } from "./validators.js";

export function bindTravelFlowView(
  result: OperatorRouteResult,
): AppBindingEnvelope<TravelFlowBindingViewModel> {
  const validation = validateRouteResultForBinding(result);

  if (!validation.ok || !result.districtPacket || result.districtPacket.districtType !== "TRAVELFLOW") {
    return {
      appKey: "TRAVELFLOW",
      bound: false,
      reason: validation.reason,
      routeDecision: result.decision,
      packet: result.districtPacket,
      viewModel: {
        routeDecision: result.decision,
        routeReason: result.reason,
        tripReady: false,
        sourceLiveRecordId: null,
        ownerId: null,
        merchantId: null,
        bookingAnchorIds: [],
        displaySummary: result.reason,
      },
    };
  }

  const packet = result.districtPacket;

  return {
    appKey: "TRAVELFLOW",
    bound: true,
    reason: "TravelFlow binding created.",
    routeDecision: result.decision,
    packet,
    viewModel: {
      routeDecision: result.decision,
      routeReason: result.reason,
      tripReady: packet.tripStatus === "ready",
      sourceLiveRecordId: packet.sourceLiveRecordId,
      ownerId: packet.ownerId,
      merchantId: packet.merchantId,
      bookingAnchorIds: packet.bookingAnchorIds,
      displaySummary: packet.summary,
    },
  };
}