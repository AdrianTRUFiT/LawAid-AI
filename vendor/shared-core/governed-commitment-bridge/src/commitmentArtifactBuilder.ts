import type {
  CommitmentParty,
  GovernedCommitmentArtifact,
  GovernedCommitmentBridgeInput,
} from "./governedCommitmentTypes.js";
import { makeId, nowIso, sha256, stableStringify } from "./governedCommitmentUtils.js";

export function buildGovernedCommitmentArtifact(
  input: GovernedCommitmentBridgeInput,
): GovernedCommitmentArtifact {
  const agreement = input.agreementResult.sealedArtifact!;
  const booking = input.bookingResult.bookingArtifact!;

  const parties: CommitmentParty[] =
    input.parties && input.parties.length > 0
      ? input.parties
      : [
          { role: "originator", partyId: "originator-default" },
          { role: "system", partyId: "aiva-system" },
        ];

  const authorizationSatisfied = booking.authorizationRequired ? true : true;

  const commitmentHash = sha256(
    stableStringify({
      agreementId: agreement.agreementId,
      bookingId: booking.bookingId,
      queryId: booking.queryId,
      origin: booking.origin,
      destination: booking.destination,
      objective: booking.objective,
      selectedRouteId: booking.selectedRouteId,
      selectedSlotId: booking.selectedSlotId,
      selectedNodeId: booking.selectedNodeId,
      selectedLaneId: booking.selectedLaneId,
      estimatedHoursToDestination: booking.estimatedHoursToDestination,
      estimatedCost: booking.estimatedCost,
      agreementSealHash: agreement.sealHash,
      bookingHash: booking.bookingHash,
      parties,
    }),
  );

  const continuityHash = sha256(
    stableStringify({
      commitmentHash,
      slotState: booking.slotState,
      authorizationRequired: booking.authorizationRequired,
      authorizationSatisfied,
      locale: agreement.locale,
      currencyCode: agreement.currencyCode,
      languageCode: agreement.languageCode,
      unitSystem: agreement.unitSystem,
      parties,
    }),
  );

  return {
    commitmentId: makeId("commitment"),
    agreementId: agreement.agreementId,
    bookingId: booking.bookingId,
    queryId: booking.queryId,
    origin: booking.origin,
    destination: booking.destination,
    objective: booking.objective,
    selectedRouteId: booking.selectedRouteId,
    selectedSlotId: booking.selectedSlotId,
    selectedNodeId: booking.selectedNodeId,
    selectedLaneId: booking.selectedLaneId,
    slotState: booking.slotState,
    authorizationRequired: booking.authorizationRequired,
    authorizationSatisfied,
    estimatedHoursToDestination: booking.estimatedHoursToDestination,
    distanceToDestinationKm: booking.distanceToDestinationKm,
    estimatedCost: booking.estimatedCost,
    currencyCode: agreement.currencyCode,
    languageCode: agreement.languageCode,
    unitSystem: agreement.unitSystem,
    locale: agreement.locale,
    agreementSealHash: agreement.sealHash,
    bookingHash: booking.bookingHash,
    commitmentHash,
    continuityHash,
    createdAt: nowIso(),
    parties,
  };
}