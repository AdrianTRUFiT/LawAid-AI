import type {
  LogisticsBookingBridgeInput,
  LogisticsBookingBridgeResult,
} from "./logisticsBookingTypes.js";
import { buildLogisticsBookingArtifact } from "./bookingArtifactBuilder.js";
import { deriveBookingRefusal } from "./refusalLogic.js";

export function runLogisticsBookingBridge(
  input: LogisticsBookingBridgeInput,
): LogisticsBookingBridgeResult {
  const refusal = deriveBookingRefusal(input);

  if (refusal) {
    return {
      status: "REFUSED",
      bookingArtifact: null,
      refusal,
      inputSummary: {
        queryId: input.searchResponse.queryId,
        routeCount: input.searchResponse.rankedRoutes.length,
        slotCount: input.slotResponse.rankedOptions.length,
        bestRouteId: input.searchResponse.bestBalancedRoute?.routeId,
        bestSlotId: input.slotResponse.bestOption?.slotId,
      },
    };
  }

  const bookingArtifact = buildLogisticsBookingArtifact(input);

  return {
    status: "BOOKING_READY",
    bookingArtifact,
    refusal: null,
    inputSummary: {
      queryId: input.searchResponse.queryId,
      routeCount: input.searchResponse.rankedRoutes.length,
      slotCount: input.slotResponse.rankedOptions.length,
      bestRouteId: input.searchResponse.bestBalancedRoute?.routeId,
      bestSlotId: input.slotResponse.bestOption?.slotId,
    },
  };
}