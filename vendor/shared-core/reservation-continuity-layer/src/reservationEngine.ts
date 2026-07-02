import type {
  ReleaseRequest,
  ReservationLayerResult,
} from "./reservationTypes.js";
import {
  createContinuityProtectionRecord,
  createReservationCommitment,
  lockReservation,
} from "./reservationLocking.js";
import { applyReleaseDecision, evaluateReleaseRequest } from "./mutualRelease.js";
import { createReservationQuote } from "./reservationQuotes.js";
import type { ReservationWindow } from "./reservationTypes.js";

export function issueLockedReservation(input: {
  routeId: string;
  flowUnitId: string;
  originNodeId: string;
  destinationNodeId: string;
  ownerId: string;
  providerId: string;
  baseAmount: number;
  currency: string;
  expiresAt: string;
  reservationWindow: ReservationWindow;
}): ReservationLayerResult {
  const quote = createReservationQuote({
    routeId: input.routeId,
    flowUnitId: input.flowUnitId,
    originNodeId: input.originNodeId,
    destinationNodeId: input.destinationNodeId,
    baseAmount: input.baseAmount,
    currency: input.currency,
    expiresAt: input.expiresAt,
    reservationWindow: input.reservationWindow,
  });

  const commitment = createReservationCommitment({
    quote,
    ownerId: input.ownerId,
    providerId: input.providerId,
  });

  const locked = lockReservation(commitment);
  const continuityProtection = createContinuityProtectionRecord(locked);

  return {
    reservationCommitment: locked,
    continuityProtection,
    releaseDecision: null,
    trusted: true,
    reason: "Reservation locked with continuity protection.",
  };
}

export function processReservationRelease(input: {
  commitment: NonNullable<ReservationLayerResult["reservationCommitment"]>;
  releaseRequest: ReleaseRequest | null;
}): ReservationLayerResult {
  const releaseDecision = evaluateReleaseRequest({
    commitment: input.commitment,
    releaseRequest: input.releaseRequest,
  });

  const nextCommitment = applyReleaseDecision({
    commitment: input.commitment,
    decision: releaseDecision,
  });

  const trusted =
    releaseDecision.releaseDecision === "APPROVED_MUTUAL_RELEASE" ||
    releaseDecision.releaseDecision === "REFUSED_ONE_SIDED_RELEASE" ||
    releaseDecision.releaseDecision === "RELEASE_NOT_REQUIRED";

  return {
    reservationCommitment: nextCommitment,
    continuityProtection: null,
    releaseDecision,
    trusted,
    reason: releaseDecision.reason,
  };
}