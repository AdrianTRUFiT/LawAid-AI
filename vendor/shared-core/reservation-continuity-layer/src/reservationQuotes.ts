import type {
  ReservationQuote,
  ReservationWindow,
} from "./reservationTypes.js";
import { buildPriceWindowSnapshot } from "./marketPricing.js";
import { makeId, nowIso } from "./reservationUtils.js";

export function createReservationQuote(input: {
  routeId: string;
  flowUnitId: string;
  originNodeId: string;
  destinationNodeId: string;
  baseAmount: number;
  currency: string;
  expiresAt: string;
  reservationWindow: ReservationWindow;
}): ReservationQuote {
  return {
    quoteId: makeId("quote"),
    routeId: input.routeId,
    flowUnitId: input.flowUnitId,
    originNodeId: input.originNodeId,
    destinationNodeId: input.destinationNodeId,
    offeredAt: nowIso(),
    expiresAt: input.expiresAt,
    priceSnapshot: buildPriceWindowSnapshot({
      baseAmount: input.baseAmount,
      currency: input.currency,
      reservationWindow: input.reservationWindow,
    }),
    quoteStatus: "open",
  };
}