import type {
  LogisticsSearchBoxQuery,
  OrchestratedSlotOption,
  SlotCapacitySearchResponse,
} from "./slotCapacityTypes.js";
import { buildSlotCapacitySnapshot } from "./capacityResistanceEngine.js";
import { buildWhyArrays } from "./frictionReasoningEngine.js";
import { normalizeSearchBoxQuery } from "./searchBoxNormalizer.js";
import { isUsableNow, nearestOpenDistance } from "./slotAvailabilityEngine.js";
import { buildSlotInventory } from "./slotInventoryEngine.js";
import { scoreOrchestratedSlot } from "./orchestrationScoringEngine.js";

export function runSlotCapacityOrchestration(
  query: LogisticsSearchBoxQuery,
): SlotCapacitySearchResponse {
  const normalized = normalizeSearchBoxQuery(query);
  const inventory = buildSlotInventory(normalized);
  const nearestDistance = nearestOpenDistance(inventory);

  const rankedOptions: OrchestratedSlotOption[] = inventory
    .map((slot) => {
      const capacity = buildSlotCapacitySnapshot(slot);
      const detail = buildWhyArrays({
        slot,
        capacity,
        nearestDistance,
      });

      return {
        slotId: slot.slotId,
        nodeId: slot.nodeId,
        laneId: slot.laneId,
        state: slot.state,
        nearestToDestination: slot.distanceToDestinationKm === nearestDistance,
        authorizationRequired: slot.authorizationRequired,
        usableNow: isUsableNow(slot),
        estimatedHoursToDestination: slot.estimatedHoursToDestination,
        distanceToDestinationKm: slot.distanceToDestinationKm,
        costEstimate: slot.costEstimate,
        downstreamFrictionScore: slot.downstreamFrictionScore,
        checkpointBurdenScore: slot.checkpointBurdenScore,
        holdNodeBenefitScore: slot.holdNodeBenefitScore,
        resistanceScore: capacity.resistanceScore,
        totalScore: scoreOrchestratedSlot({
          query: normalized,
          slot,
          capacity,
        }),
        why: detail.why,
        who: detail.who,
        what: detail.what,
        where: detail.where,
        when: detail.when,
        how: detail.how,
      } satisfies OrchestratedSlotOption;
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  const summary = {
    totalSlotsSeen: inventory.length,
    openCount: inventory.filter((x) => x.state === "open").length,
    occupiedCount: inventory.filter((x) => x.state === "occupied").length,
    reservedCount: inventory.filter((x) => x.state === "reserved").length,
    blockedCount: inventory.filter((x) => x.state === "blocked").length,
    authorizationRequiredCount: inventory.filter((x) => x.state === "authorization_required").length,
  };

  return {
    queryId: normalized.queryId,
    origin: normalized.origin,
    destination: normalized.destination,
    objective: normalized.objective,
    bestOption: rankedOptions[0],
    rankedOptions,
    summary,
    generatedAt: new Date().toISOString(),
  };
}