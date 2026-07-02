import type { RouteVariableSnapshot } from "./valuationTypes.js";
import { round2 } from "./valuationUtils.js";

export function computePressureScore(
  route: RouteVariableSnapshot,
): number {
  const valueWeight =
    route.valueClass === "critical"
      ? 24
      : route.valueClass === "high"
      ? 18
      : route.valueClass === "standard"
      ? 10
      : 4;

  const substitutePenalty = 100 - route.substituteAvailabilityScore;
  const delayPenalty = 100 - route.delayToleranceScore;

  return round2(
    valueWeight +
      route.urgencyScore * 0.22 +
      route.weatherRiskScore * 0.12 +
      route.dependencyRiskScore * 0.18 +
      substitutePenalty * 0.16 +
      delayPenalty * 0.16 +
      route.consequenceOfFailureScore * 0.2,
  );
}