import type {
  OptimizationRecommendation,
  RouteStressSnapshot,
  TransportOptimizationInput,
} from "./optimizationTypes.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function buildRouteStressSnapshots(
  input: TransportOptimizationInput,
): RouteStressSnapshot[] {
  return input.routePlans.map((routePlan) => {
    const totalLegs = routePlan.laneSequence.length;
    const transferPoints = routePlan.expectedTransferPoints.length;
    const fallbackRoutes = routePlan.fallbackRouteIds.length;
    const stressScore =
      Math.round(((totalLegs * 8) + (transferPoints * 15) - (fallbackRoutes * 5)) * 100) / 100;

    return {
      routeId: routePlan.routeId,
      totalLegs,
      transferPoints,
      fallbackRoutes,
      stressScore,
    };
  });
}

export function buildRouteStressRecommendations(
  snapshots: RouteStressSnapshot[],
): OptimizationRecommendation[] {
  const results: OptimizationRecommendation[] = [];

  for (const snapshot of snapshots) {
    if (snapshot.stressScore >= 40) {
      results.push({
        recommendationId: makeId("opt"),
        type: "ROUTE_STRESS_ALERT",
        severity: snapshot.stressScore >= 60 ? "high" : "medium",
        reason: `Route stress score is ${snapshot.stressScore}.`,
        targetId: snapshot.routeId,
        action: "Review leg count, transfer density, and fallback coverage.",
        projectedBenefitScore: snapshot.stressScore >= 60 ? 0.78 : 0.48,
      });
    }
  }

  return results;
}