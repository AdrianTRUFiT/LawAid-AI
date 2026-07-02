import type {
  DwellSnapshot,
  OptimizationRecommendation,
  TransportOptimizationInput,
} from "./optimizationTypes.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function buildDwellSnapshots(
  input: TransportOptimizationInput,
): DwellSnapshot[] {
  return input.nodes.map((node) => {
    const estimatedDwellHours =
      node.throughputLimitPerHour > 0
        ? Math.round((node.queueDepth / node.throughputLimitPerHour) * 100) / 100
        : 999;

    return {
      nodeId: node.nodeId,
      queueDepth: node.queueDepth,
      throughputLimitPerHour: node.throughputLimitPerHour,
      estimatedDwellHours,
    };
  });
}

export function buildDwellRecommendations(
  snapshots: DwellSnapshot[],
): OptimizationRecommendation[] {
  const results: OptimizationRecommendation[] = [];

  for (const snapshot of snapshots) {
    if (snapshot.estimatedDwellHours >= 2) {
      results.push({
        recommendationId: makeId("opt"),
        type: "DWELL_REDUCTION",
        severity: snapshot.estimatedDwellHours >= 4 ? "high" : "medium",
        reason: `Estimated dwell is ${snapshot.estimatedDwellHours} hours.`,
        targetId: snapshot.nodeId,
        action: "Reduce staging delay or rebalance node intake volume.",
        projectedBenefitScore: snapshot.estimatedDwellHours >= 4 ? 0.8 : 0.5,
      });
    }
  }

  return results;
}