import type {
  CapacityResistanceClass,
  SlotCapacitySnapshot,
  SlotInventoryRecord,
} from "./slotCapacityTypes.js";
import { round2 } from "./slotCapacityUtils.js";

export function buildSlotCapacitySnapshot(
  slot: SlotInventoryRecord,
): SlotCapacitySnapshot {
  const utilizationRate =
    slot.maxUnits > 0 ? round2((slot.occupiedUnits / slot.maxUnits) * 100) : 0;

  const baseResistance =
    utilizationRate * 0.7 +
    slot.downstreamFrictionScore * 0.2 +
    slot.checkpointBurdenScore * 0.1;

  let resistanceClass: CapacityResistanceClass = "low";

  if (baseResistance >= 85) {
    resistanceClass = "critical";
  } else if (baseResistance >= 65) {
    resistanceClass = "high";
  } else if (baseResistance >= 40) {
    resistanceClass = "moderate";
  }

  return {
    slotId: slot.slotId,
    nodeId: slot.nodeId,
    utilizationRate,
    remainingUnits: Math.max(0, slot.maxUnits - slot.occupiedUnits),
    resistanceScore: round2(baseResistance),
    resistanceClass,
  };
}