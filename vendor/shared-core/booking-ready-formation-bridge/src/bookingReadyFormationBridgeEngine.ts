import type {
  BookingReadyFormationArtifact,
  BookingReadyFormationBridgeInput,
  BookingReadyFormationBridgeResult,
  BookingReadyStatus,
} from "./bookingReadyFormationBridgeTypes.js";
import {
  makeBookingReadyId,
  nowIso,
} from "./bookingReadyFormationBridgeUtils.js";

export function runBookingReadyFormationBridge(
  input: BookingReadyFormationBridgeInput,
): BookingReadyFormationBridgeResult {
  if (!input.poolingThreshold || !input.qualityGate || !input.pnlGuard) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Booking-ready formation bridge refused because one or more upstream inputs are missing.",
      },
    };
  }

  if (
    input.subjectId !== input.poolingThreshold.subjectId ||
    input.subjectId !== input.qualityGate.subjectId ||
    input.subjectId !== input.pnlGuard.subjectId
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Booking-ready formation bridge refused because subject identity does not match across inputs.",
      },
    };
  }

  let bookingReadyStatus: BookingReadyStatus;
  let releaseEligible = false;
  let sourcingMode: "isolated" | "pooled" | "not_ready" = "not_ready";
  let bookingReadyReason = "";

  const poolingReady =
    input.poolingThreshold.poolingStatus === "POOLING_READY" ||
    input.poolingThreshold.poolingStatus === "ISOLATED";

  const qualityPassed = input.qualityGate.qualityGateStatus === "QUALITY_PASSED";
  const pnlPassed = input.pnlGuard.pnlGuardStatus === "PNL_PASSED";

  if (!poolingReady) {
    bookingReadyStatus = "BOOKING_HELD";
    bookingReadyReason = "Pooling conditions are not yet ready for booking formation.";
  } else if (!qualityPassed) {
    bookingReadyStatus = "BOOKING_BLOCKED";
    bookingReadyReason = "Quality conditions do not support booking formation.";
  } else if (!pnlPassed) {
    bookingReadyStatus = "BOOKING_BLOCKED";
    bookingReadyReason = "P&L conditions do not support booking formation.";
  } else {
    bookingReadyStatus = "BOOKING_READY";
    releaseEligible = input.pnlGuard.releaseEconomicallySafe && input.qualityGate.releaseSafe;
    sourcingMode = input.poolingThreshold.poolingStatus === "ISOLATED" ? "isolated" : "pooled";
    bookingReadyReason = "Pooling, quality, and P&L conditions are aligned for booking-ready formation.";
  }

  const artifact: BookingReadyFormationArtifact = {
    bookingReadyId: makeBookingReadyId(input.subjectId),
    subjectId: input.subjectId,
    bookingReadyStatus,
    releaseEligible,
    sourcingMode,
    bookingReadyReason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}