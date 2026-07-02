import {
  createReservationWindow,
  issueLockedReservation,
  processReservationRelease,
} from "../src/index.js";

const now = new Date();
const later = new Date(now.getTime() + 2 * 60 * 60 * 1000);

const window = createReservationWindow({
  marketWindowType: "scarcity_window",
  startsAt: now.toISOString(),
  endsAt: later.toISOString(),
  scarcityLevel: 80,
  demandLevel: 85,
  routeReliabilityScore: 88,
});

const locked = issueLockedReservation({
  routeId: "route_lock_003",
  flowUnitId: "flow_lock_003",
  originNodeId: "origin_003",
  destinationNodeId: "destination_003",
  ownerId: "owner_003",
  providerId: "provider_003",
  baseAmount: 150,
  currency: "USD",
  expiresAt: later.toISOString(),
  reservationWindow: window,
});

if (!locked.reservationCommitment) {
  throw new Error("Expected locked commitment.");
}

const released = processReservationRelease({
  commitment: locked.reservationCommitment,
  releaseRequest: {
    requestId: "release_002",
    reservationId: locked.reservationCommitment.reservationId,
    requestedBy: "provider_003",
    reason: "Mutually agreed release.",
    counterpartApproved: true,
    createdAt: new Date().toISOString(),
  },
});

if (!released.releaseDecision || released.releaseDecision.releaseDecision !== "APPROVED_MUTUAL_RELEASE") {
  throw new Error("Expected mutual release approval.");
}

if (!released.reservationCommitment || released.reservationCommitment.reservationState !== "MUTUALLY_RELEASED") {
  throw new Error("Expected mutually released reservation state.");
}

console.log("SMOKE_RESERVATION_MUTUAL_RELEASE=PASS");