import type { HoldNodeValueSnapshot } from "./valuationTypes.js";
import { round2 } from "./valuationUtils.js";

export function computeHoldNodeStrategicValue(
  holdNode: HoldNodeValueSnapshot | null | undefined,
): number {
  if (!holdNode) return 0;

  return round2(
    holdNode.optionalityPreservationScore * 0.2 +
      holdNode.stagingUtilityScore * 0.2 +
      holdNode.relayUtilityScore * 0.16 +
      holdNode.costReliefScore * 0.16 +
      holdNode.timingImprovementScore * 0.14 +
      holdNode.strategicHoldValueScore * 0.14,
  );
}