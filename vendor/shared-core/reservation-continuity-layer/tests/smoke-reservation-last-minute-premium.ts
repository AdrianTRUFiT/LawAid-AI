import { createReservationWindow, issueLockedReservation } from "../src/index.js";

const now = new Date();
const later = new Date(now.getTime() + 15 * 60 * 1000);

const window = createReservationWindow({
  marketWindowType: "last_minute_window",
  startsAt: now.toISOString(),
  endsAt: later.toISOString(),
  scarcityLevel: 95,
  demandLevel: 92,
  routeReliabilityScore: 86,
});

const result = issueLockedReservation({
  routeId: "route_last_004",
  flowUnitId: "flow_last_004",
  originNodeId: "origin_004",
  destinationNodeId: "destination_004",
  ownerId: "owner_004",
  providerId: "provider_004",
  baseAmount: 100,
  currency: "USD",
  expiresAt: later.toISOString(),
  reservationWindow: window,
});

if (!result.reservationCommitment) {
  throw new Error("Expected locked commitment.");
}

const finalAmount = result.reservationCommitment.priceSnapshot.finalAmount;

if (finalAmount <= 100) {
  throw new Error(`Expected premium pricing above base amount but received ${finalAmount}.`);
}

console.log("SMOKE_RESERVATION_LAST_MINUTE_PREMIUM=PASS");