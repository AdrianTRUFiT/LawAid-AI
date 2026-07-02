import type {
  BottleneckSnapshot,
  OptimizationRecommendation,
  TransportOptimizationInput,
} from "./optimizationTypes.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function buildBottleneckSnapshots(
  input: TransportOptimizationInput,
): BottleneckSnapshot[] {
  return input.nodes.map((node) => {
    const bottleneckScore =
      node.throughputLimitPerHour > 0
        ? Math.round(((node.queueDepth / node.throughputLimitPerHour) * 100) * 100) / 100
        : 999;

    return {
      nodeId: node.nodeId,
      queueDepth: node.queueDepth,
      throughputLimitPerHour: node.throughputLimitPerHour,
      bottleneckScore,
    };
  });
}

export function buildBottleneckRecommendations(
  snapshots: BottleneckSnapshot[],
): OptimizationRecommendation[] {
  const results: OptimizationRecommendation[] = [];

  for (const snapshot of snapshots) {
    if (snapshot.bottleneckScore >= 75) {
      results.push({
        recommendationId: makeId("opt"),
        type: "BOTTLENECK_RELIEF",
        severity: snapshot.bottleneckScore >= 150 ? "high" : "medium",
        reason: `Node bottleneck score is ${snapshot.bottleneckScore}.`,
        targetId: snapshot.nodeId,
        action: "Shift intake, raise throughput, or reroute compatible volume.",
        projectedBenefitScore: snapshot.bottleneckScore >= 150 ? 0.82 : 0.52,
      });
    }
  }

  return results;
}