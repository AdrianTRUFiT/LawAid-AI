import type {
  ContinuityProtectionRecord,
  ReservationCommitment,
  ReservationQuote,
} from "./reservationTypes.js";
import { makeId, nowIso } from "./reservationUtils.js";

export function createReservationCommitment(input: {
  quote: ReservationQuote;
  ownerId: string;
  providerId: string;
}): ReservationCommitment {
  return {
    reservationId: makeId("reservation"),
    quoteId: input.quote.quoteId,
    routeId: input.quote.routeId,
    flowUnitId: input.quote.flowUnitId,
    ownerId: input.ownerId,
    providerId: input.providerId,
    committedAt: nowIso(),
    priceSnapshot: input.quote.priceSnapshot,
    reservationState: "RESERVED",
    irreversibleByDefault: true,
    mutualReleaseOnly: true,
  };
}

export function lockReservation(
  commitment: ReservationCommitment,
): ReservationCommitment {
  return {
    ...commitment,
    lockedAt: nowIso(),
    reservationState: "LOCKED",
  };
}

export function createContinuityProtectionRecord(
  commitment: ReservationCommitment,
): ContinuityProtectionRecord {
  return {
    recordId: makeId("continuity"),
    reservationId: commitment.reservationId,
    protectedPriceAmount: commitment.priceSnapshot.finalAmount,
    currency: commitment.priceSnapshot.currency,
    routeId: commitment.routeId,
    lockState: "protected",
    downstreamMarketChangeIgnored: true,
    createdAt: nowIso(),
  };
}