import type { NodeCapacitySnapshot, StrategicNodeInput } from "./nodeModelTypes.js";
import { round2 } from "./nodeModelUtils.js";

export function buildNodeCapacitySnapshot(
  node: StrategicNodeInput,
): NodeCapacitySnapshot {
  const utilizationRate =
    node.maxCapacityUnits > 0
      ? round2((node.currentLoadUnits / node.maxCapacityUnits) * 100)
      : 0;

  return {
    nodeId: node.nodeId,
    maxCapacityUnits: node.maxCapacityUnits,
    currentLoadUnits: node.currentLoadUnits,
    utilizationRate,
    spareCapacityUnits: Math.max(0, node.maxCapacityUnits - node.currentLoadUnits),
  };
}