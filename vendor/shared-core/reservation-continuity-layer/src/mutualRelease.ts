import type {
  MutualReleaseDecisionRecord,
  ReleaseRequest,
  ReservationCommitment,
  ReleaseDecision,
} from "./reservationTypes.js";
import { makeId, nowIso } from "./reservationUtils.js";

export function evaluateReleaseRequest(input: {
  commitment: ReservationCommitment;
  releaseRequest: ReleaseRequest | null;
}): MutualReleaseDecisionRecord {
  let releaseDecision: ReleaseDecision = "RELEASE_NOT_REQUIRED";
  let reason = "No release request submitted.";

  if (input.releaseRequest) {
    if (input.commitment.reservationState !== "LOCKED" && input.commitment.reservationState !== "RESERVED") {
      releaseDecision = "RELEASE_NOT_REQUIRED";
      reason = "Reservation is not in release-sensitive state.";
    } else if (!input.releaseRequest.counterpartApproved) {
      releaseDecision = "REFUSED_ONE_SIDED_RELEASE";
      reason = "One-sided release is refused by default.";
    } else {
      releaseDecision = "APPROVED_MUTUAL_RELEASE";
      reason = "Mutual release approved.";
    }
  }

  return {
    decisionId: makeId("release"),
    reservationId: input.commitment.reservationId,
    releaseDecision,
    reason,
    decidedAt: nowIso(),
  };
}

export function applyReleaseDecision(input: {
  commitment: ReservationCommitment;
  decision: MutualReleaseDecisionRecord;
}): ReservationCommitment {
  if (input.decision.releaseDecision === "APPROVED_MUTUAL_RELEASE") {
    return {
      ...input.commitment,
      reservationState: "MUTUALLY_RELEASED",
    };
  }

  if (
    input.decision.releaseDecision === "REFUSED_ONE_SIDED_RELEASE" ||
    input.decision.releaseDecision === "REFUSED_LOCKED_COMMITMENT"
  ) {
    return {
      ...input.commitment,
      reservationState: "REFUSED_RELEASE",
    };
  }

  return input.commitment;
}