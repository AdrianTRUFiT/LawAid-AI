import type {
  PriceWindowSnapshot,
  PricingAdjustmentType,
  ReservationWindow,
} from "./reservationTypes.js";
import { makeId, nowIso } from "./reservationUtils.js";

export function buildPriceWindowSnapshot(input: {
  baseAmount: number;
  currency: string;
  reservationWindow: ReservationWindow;
}): PriceWindowSnapshot {
  let finalAmount = input.baseAmount;
  const rationale: string[] = [];
  let prebookDiscountApplied = false;
  let scarcityPremiumApplied = false;
  let lastMinutePremiumApplied = false;
  let reliabilityPremiumApplied = false;

  const adjustments = new Set<PricingAdjustmentType>(input.reservationWindow.pricingAdjustments);

  if (adjustments.has("PREBOOK_BONUS")) {
    finalAmount -= input.baseAmount * 0.1;
    prebookDiscountApplied = true;
    rationale.push("Prebook bonus reduced price for earlier certainty.");
  }

  if (adjustments.has("SCARCITY_PREMIUM")) {
    finalAmount += input.baseAmount * 0.15;
    scarcityPremiumApplied = true;
    rationale.push("Scarcity premium applied due to constrained current capacity.");
  }

  if (adjustments.has("LAST_MINUTE_PREMIUM")) {
    finalAmount += input.baseAmount * 0.2;
    lastMinutePremiumApplied = true;
    rationale.push("Last-minute premium applied for near-term commitment timing.");
  }

  if (adjustments.has("RELIABILITY_PREMIUM")) {
    finalAmount += input.baseAmount * 0.08;
    reliabilityPremiumApplied = true;
    rationale.push("Reliability premium applied for protected continuity and lower downstream consequence.");
  }

  finalAmount = Math.round(finalAmount * 100) / 100;

  return {
    snapshotId: makeId("price"),
    baseAmount: input.baseAmount,
    finalAmount,
    currency: input.currency,
    marketWindowType: input.reservationWindow.marketWindowType,
    prebookDiscountApplied,
    scarcityPremiumApplied,
    lastMinutePremiumApplied,
    reliabilityPremiumApplied,
    rationale,
    createdAt: nowIso(),
  };
}