import type { CheckpointBurdenSnapshot } from "./valuationTypes.js";
import { round2 } from "./valuationUtils.js";

export function computeBurdenScore(
  checkpoint: CheckpointBurdenSnapshot,
): number {
  const levelWeight =
    checkpoint.burdenLevel === "critical"
      ? 30
      : checkpoint.burdenLevel === "heavy"
      ? 22
      : checkpoint.burdenLevel === "moderate"
      ? 14
      : 6;

  return round2(
    levelWeight +
      checkpoint.handlingComplexityScore * 0.18 +
      checkpoint.documentationComplexityScore * 0.16 +
      checkpoint.complianceRiskScore * 0.2 +
      checkpoint.timingSensitivityScore * 0.15 +
      checkpoint.requiredManualInterventionScore * 0.14,
  );
}