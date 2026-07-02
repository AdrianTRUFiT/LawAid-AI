import type {
  LogisticsSearchBoxQuery,
  SlotCapacitySnapshot,
  SlotInventoryRecord,
} from "./slotCapacityTypes.js";
import { round2 } from "./slotCapacityUtils.js";

export function scoreOrchestratedSlot(input: {
  query: Required<LogisticsSearchBoxQuery>;
  slot: SlotInventoryRecord;
  capacity: SlotCapacitySnapshot;
}): number {
  const speedScore = 100 - input.slot.estimatedHoursToDestination * 6;
  const costScore = 100 - input.slot.costEstimate * 0.22;
  const frictionScore = 100 - input.slot.downstreamFrictionScore;
  const burdenScore = 100 - input.slot.checkpointBurdenScore;
  const resistanceScore = 100 - input.capacity.resistanceScore;
  const holdScore = input.slot.holdNodeBenefitScore;
  const proximityScore = 100 - input.slot.distanceToDestinationKm * 0.8;
  const availabilityBoost =
    input.slot.state === "open" ? 20 :
    input.slot.state === "reserved" ? 12 :
    input.slot.state === "authorization_required" ? 6 :
    input.slot.state === "occupied" ? -50 : -80;

  const authPenalty = input.slot.authorizationRequired ? 8 : 0;
  const objective = input.query.objective;

  let total = 0;

  if (objective === "fastest") {
    total =
      speedScore * 0.28 +
      proximityScore * 0.18 +
      frictionScore * 0.14 +
      resistanceScore * 0.1 +
      burdenScore * 0.08 +
      costScore * 0.08 +
      holdScore * 0.06 +
      availabilityBoost - authPenalty;
  } else if (objective === "cheapest") {
    total =
      costScore * 0.28 +
      frictionScore * 0.16 +
      resistanceScore * 0.14 +
      burdenScore * 0.12 +
      holdScore * 0.08 +
      speedScore * 0.08 +
      proximityScore * 0.06 +
      availabilityBoost - authPenalty;
  } else {
    total =
      speedScore * 0.16 +
      costScore * 0.16 +
      frictionScore * 0.16 +
      resistanceScore * 0.12 +
      burdenScore * 0.1 +
      holdScore * 0.08 +
      proximityScore * 0.1 +
      availabilityBoost - authPenalty;
  }

  return round2(total);
}