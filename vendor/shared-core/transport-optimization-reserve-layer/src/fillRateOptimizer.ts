import type {
  FillRateSnapshot,
  OptimizationRecommendation,
  TransportOptimizationInput,
} from "./optimizationTypes.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function buildFillRateSnapshots(
  input: TransportOptimizationInput,
): FillRateSnapshot[] {
  return (input.consolidationGroups ?? []).map((group) => {
    const fillRate =
      group.capacityMax > 0
        ? Math.round((group.capacityUsed / group.capacityMax) * 10000) / 100
        : 0;

    return {
      groupId: group.groupId,
      capacityUsed: group.capacityUsed,
      capacityMax: group.capacityMax,
      fillRate,
    };
  });
}

export function buildFillRateRecommendations(
  snapshots: FillRateSnapshot[],
): OptimizationRecommendation[] {
  const results: OptimizationRecommendation[] = [];

  for (const snapshot of snapshots) {
    if (snapshot.fillRate < 60) {
      results.push({
        recommendationId: makeId("opt"),
        type: "FILL_RATE_IMPROVEMENT",
        severity: snapshot.fillRate < 35 ? "high" : "medium",
        reason: `Fill rate is ${snapshot.fillRate}%, below efficient threshold.`,
        targetId: snapshot.groupId,
        action: "Combine compatible outbound units or reduce asset size on this lane.",
        projectedBenefitScore: snapshot.fillRate < 35 ? 0.85 : 0.55,
      });
    }
  }

  return results;
}