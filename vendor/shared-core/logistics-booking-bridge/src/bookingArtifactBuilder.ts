import type {
  BookingParty,
  LogisticsBookingArtifact,
  LogisticsBookingBridgeInput,
} from "./logisticsBookingTypes.js";
import { makeId, nowIso, sha256, stableStringify } from "./logisticsBookingUtils.js";

export function buildLogisticsBookingArtifact(
  input: LogisticsBookingBridgeInput,
): LogisticsBookingArtifact {
  const bestRoute = input.searchResponse.bestBalancedRoute;
  const bestSlot = input.slotResponse.bestOption;

  const parties: BookingParty[] =
    input.parties && input.parties.length > 0
      ? input.parties
      : [
          { role: "shipper", partyId: "shipper-default" },
          { role: "system", partyId: "aiva-system" },
        ];

  const bookingHash = sha256(
    stableStringify({
      queryId: input.searchResponse.queryId,
      origin: input.searchResponse.fastestRoute.origin,
      destination: input.searchResponse.fastestRoute.destination,
      selectedRouteId: bestRoute.routeId,
      selectedSlotId: bestSlot.slotId,
      selectedNodeId: bestSlot.nodeId,
      selectedLaneId: bestSlot.laneId,
      objective: input.searchResponse.objective,
      authorizationRequired: bestSlot.authorizationRequired,
      estimatedHoursToDestination: bestSlot.estimatedHoursToDestination,
      estimatedCost: bestSlot.costEstimate,
      parties,
    }),
  );

  const continuityHash = sha256(
    stableStringify({
      bookingHash,
      slotState: bestSlot.state,
      downstreamFrictionScore: bestSlot.downstreamFrictionScore,
      checkpointBurdenScore: bestSlot.checkpointBurdenScore,
      resistanceScore: bestSlot.resistanceScore,
      routeTags: bestRoute.tags,
      routeRankReason: bestRoute.rankReason,
      parties,
    }),
  );

  return {
    bookingId: makeId("booking"),
    queryId: input.searchResponse.queryId,
    origin: input.searchResponse.fastestRoute.origin,
    destination: input.searchResponse.fastestRoute.destination,
    objective: input.searchResponse.objective,
    selectedRouteId: bestRoute.routeId,
    selectedSlotId: bestSlot.slotId,
    selectedNodeId: bestSlot.nodeId,
    selectedLaneId: bestSlot.laneId,
    slotState: bestSlot.state,
    authorizationRequired: bestSlot.authorizationRequired,
    estimatedHoursToDestination: bestSlot.estimatedHoursToDestination,
    distanceToDestinationKm: bestSlot.distanceToDestinationKm,
    estimatedCost: bestSlot.costEstimate,
    downstreamFrictionScore: bestSlot.downstreamFrictionScore,
    checkpointBurdenScore: bestSlot.checkpointBurdenScore,
    resistanceScore: bestSlot.resistanceScore,
    routeTags: bestRoute.tags,
    routeRankReason: bestRoute.rankReason,
    bookingHash,
    continuityHash,
    createdAt: nowIso(),
    parties,
  };
}