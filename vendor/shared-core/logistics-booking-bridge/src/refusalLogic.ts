import type {
  LogisticsBookingBridgeInput,
  LogisticsBookingRefusal,
} from "./logisticsBookingTypes.js";

export function deriveBookingRefusal(
  input: LogisticsBookingBridgeInput,
): LogisticsBookingRefusal | null {
  if (input.searchResponse.rankedRoutes.length === 0) {
    return {
      refusalCode: "NO_ROUTE_OPTIONS",
      refusalReason: "Booking refused because no ranked route options exist.",
    };
  }

  const bestSlot = input.slotResponse.bestOption;

  if (!bestSlot) {
    return {
      refusalCode: "NO_USABLE_SLOT",
      refusalReason: "Booking refused because no usable slot option exists.",
    };
  }

  if (bestSlot.state === "blocked") {
    return {
      refusalCode: "BLOCKED_SLOT",
      refusalReason: "Booking refused because the best slot is blocked.",
      slotId: bestSlot.slotId,
      nodeId: bestSlot.nodeId,
    };
  }

  if (bestSlot.state === "occupied") {
    return {
      refusalCode: "OCCUPIED_SLOT",
      refusalReason: "Booking refused because the best slot is occupied.",
      slotId: bestSlot.slotId,
      nodeId: bestSlot.nodeId,
    };
  }

  if (bestSlot.authorizationRequired && !input.authorizationGranted) {
    return {
      refusalCode: "AUTHORIZATION_REQUIRED",
      refusalReason: "Booking refused because slot authorization is required and was not granted.",
      slotId: bestSlot.slotId,
      nodeId: bestSlot.nodeId,
    };
  }

  return null;
}