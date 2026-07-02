import type {
  GovernedCommitmentBridgeInput,
  GovernedCommitmentRefusal,
} from "./governedCommitmentTypes.js";

export function deriveGovernedCommitmentRefusal(
  input: GovernedCommitmentBridgeInput,
): GovernedCommitmentRefusal | null {
  if (!input.agreementResult) {
    return {
      refusalCode: "AGREEMENT_MISSING",
      refusalReason: "Governed commitment refused because agreement input is missing.",
    };
  }

  if (!input.bookingResult) {
    return {
      refusalCode: "BOOKING_MISSING",
      refusalReason: "Governed commitment refused because booking input is missing.",
    };
  }

  if (input.agreementResult.status !== "SEALED" || !input.agreementResult.sealedArtifact) {
    return {
      refusalCode: "AGREEMENT_NOT_SEALED",
      refusalReason: "Governed commitment refused because agreement is not sealed.",
    };
  }

  if (input.bookingResult.status !== "BOOKING_READY" || !input.bookingResult.bookingArtifact) {
    return {
      refusalCode: "BOOKING_NOT_READY",
      refusalReason: "Governed commitment refused because booking is not ready.",
    };
  }

  const agreement = input.agreementResult.sealedArtifact;
  const booking = input.bookingResult.bookingArtifact;

  if (agreement.origin !== booking.origin || agreement.destination !== booking.destination) {
    return {
      refusalCode: "ORIGIN_DESTINATION_MISMATCH",
      refusalReason: "Governed commitment refused because agreement and booking origin/destination do not match.",
    };
  }

  if (booking.authorizationRequired && !booking.authorizationRequired === false) {
    return {
      refusalCode: "AUTHORIZATION_INCOMPLETE",
      refusalReason: "Governed commitment refused because booking authorization remains incomplete.",
    };
  }

  if (!["open", "reserved", "authorization_required"].includes(booking.slotState)) {
    return {
      refusalCode: "SLOT_STATE_INELIGIBLE",
      refusalReason: "Governed commitment refused because slot state is not commitment-eligible.",
    };
  }

  return null;
}