import type {
  PricingAdjustmentType,
  ReservationWindow,
} from "./reservationTypes.js";
import { makeId } from "./reservationUtils.js";

export function createReservationWindow(input: {
  marketWindowType: ReservationWindow["marketWindowType"];
  startsAt: string;
  endsAt: string;
  scarcityLevel: number;
  demandLevel: number;
  routeReliabilityScore: number;
}): ReservationWindow {
  const pricingAdjustments: PricingAdjustmentType[] = [];

  if (input.marketWindowType === "prebook_bonus") {
    pricingAdjustments.push("PREBOOK_BONUS");
  }

  if (input.marketWindowType === "scarcity_window") {
    pricingAdjustments.push("SCARCITY_PREMIUM");
  }

  if (input.marketWindowType === "last_minute_window") {
    pricingAdjustments.push("LAST_MINUTE_PREMIUM");
  }

  if (input.routeReliabilityScore >= 85) {
    pricingAdjustments.push("RELIABILITY_PREMIUM");
  }

  if (pricingAdjustments.length === 0) {
    pricingAdjustments.push("STANDARD_PRICE");
  }

  return {
    windowId: makeId("window"),
    marketWindowType: input.marketWindowType,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    scarcityLevel: input.scarcityLevel,
    demandLevel: input.demandLevel,
    routeReliabilityScore: input.routeReliabilityScore,
    pricingAdjustments,
  };
}