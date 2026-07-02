import {
  createReservationWindow,
  issueLockedReservation,
  processReservationRelease,
} from "../src/index.js";

const now = new Date();
const later = new Date(now.getTime() + 60 * 60 * 1000);

const window = createReservationWindow({
  marketWindowType: "standard_window",
  startsAt: now.toISOString(),
  endsAt: later.toISOString(),
  scarcityLevel: 50,
  demandLevel: 50,
  routeReliabilityScore: 70,
});

const locked = issueLockedReservation({
  routeId: "route_lock_002",
  flowUnitId: "flow_lock_002",
  originNodeId: "origin_002",
  destinationNodeId: "destination_002",
  ownerId: "owner_002",
  providerId: "provider_002",
  baseAmount: 120,
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
    requestId: "release_001",
    reservationId: locked.reservationCommitment.reservationId,
    requestedBy: "owner_002",
    reason: "Changed my mind.",
    counterpartApproved: false,
    createdAt: new Date().toISOString(),
  },
});

if (!released.releaseDecision || released.releaseDecision.releaseDecision !== "REFUSED_ONE_SIDED_RELEASE") {
  throw new Error("Expected one-sided release refusal.");
}

console.log("SMOKE_RESERVATION_ONE_SIDED_RELEASE_REFUSAL=PASS");