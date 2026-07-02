import type {
  NodePressureClass,
  NodePressureSnapshot,
  StrategicNodeInput,
} from "./nodeModelTypes.js";
import { round2 } from "./nodeModelUtils.js";

export function buildNodePressureSnapshot(
  node: StrategicNodeInput,
): NodePressureSnapshot {
  const pressureScore = round2(
    node.queueDepth * 0.25 +
    node.dwellHoursEstimate * 8 +
    node.routeDemandScore * 0.35 +
    (node.maxCapacityUnits > 0 ? (node.currentLoadUnits / node.maxCapacityUnits) * 30 : 0),
  );

  let pressureClass: NodePressureClass = "stable";

  if (pressureScore >= 80) {
    pressureClass = "critical";
  } else if (pressureScore >= 55) {
    pressureClass = "strained";
  } else if (pressureScore >= 30) {
    pressureClass = "watch";
  }

  return {
    nodeId: node.nodeId,
    queueDepth: node.queueDepth,
    dwellHoursEstimate: node.dwellHoursEstimate,
    routeDemandScore: node.routeDemandScore,
    pressureScore,
    pressureClass,
  };
}