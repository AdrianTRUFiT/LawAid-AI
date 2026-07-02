import { createReservationWindow, issueLockedReservation } from "../src/index.js";

const now = new Date();
const later = new Date(now.getTime() + 24 * 60 * 60 * 1000);

const window = createReservationWindow({
  marketWindowType: "prebook_bonus",
  startsAt: now.toISOString(),
  endsAt: later.toISOString(),
  scarcityLevel: 20,
  demandLevel: 40,
  routeReliabilityScore: 90,
});

const result = issueLockedReservation({
  routeId: "route_prebook_001",
  flowUnitId: "flow_prebook_001",
  originNodeId: "origin_001",
  destinationNodeId: "destination_001",
  ownerId: "owner_001",
  providerId: "provider_001",
  baseAmount: 100,
  currency: "USD",
  expiresAt: later.toISOString(),
  reservationWindow: window,
});

if (!result.trusted || !result.reservationCommitment || result.reservationCommitment.reservationState !== "LOCKED") {
  throw new Error("Expected locked reservation.");
}

if (!result.continuityProtection || !result.continuityProtection.downstreamMarketChangeIgnored) {
  throw new Error("Expected continuity protection.");
}

console.log("SMOKE_RESERVATION_PREBOOK_LOCK=PASS");