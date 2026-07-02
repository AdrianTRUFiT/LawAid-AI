import type {
  OptimizationRecommendation,
  TransportOptimizationInput,
} from "./optimizationTypes.js";

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function buildBackhaulRecommendations(
  input: TransportOptimizationInput,
): OptimizationRecommendation[] {
  const results: OptimizationRecommendation[] = [];
  const groups = input.consolidationGroups ?? [];

  for (const group of groups) {
    if (group.direction === "outbound" && !group.returnPathPlan) {
      results.push({
        recommendationId: makeId("opt"),
        type: "BACKHAUL_MATCH",
        severity: "medium",
        reason: "Outbound consolidation group has no return path plan.",
        targetId: group.groupId,
        action: "Search for compatible inbound or reverse-lane utilization.",
        projectedBenefitScore: 0.58,
      });
    }
  }

  return results;
}