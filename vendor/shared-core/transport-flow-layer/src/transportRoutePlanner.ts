import type { RoutePlan, RouteLeg, TransportNode } from "./transportTypes.js";

export function createRoutePlan(input: {
  routeId: string;
  laneSequence: RouteLeg[];
  transportModes?: string[];
  expectedTransferPoints?: string[];
  fallbackRouteIds?: string[];
  optimizationFlags?: string[];
}): RoutePlan {
  return {
    routeId: input.routeId,
    laneSequence: input.laneSequence,
    transportModes: input.transportModes ?? [],
    expectedTransferPoints: input.expectedTransferPoints ?? [],
    expectedTimingWindows: input.laneSequence
      .map((leg) => leg.expectedWindow)
      .filter((value): value is NonNullable<RouteLeg["expectedWindow"]> => value !== undefined),
    fallbackRouteIds: input.fallbackRouteIds ?? [],
    optimizationFlags: input.optimizationFlags ?? [],
  };
}

export function validateRoutePlan(input: {
  routePlan: RoutePlan;
  originNodeId: string;
  destinationNodeId: string;
  availableNodes: TransportNode[];
}): { ok: boolean; reason: string } {
  if (input.routePlan.laneSequence.length < 2) {
    return {
      ok: false,
      reason: "Route plan must contain at least two legs.",
    };
  }

  const first = input.routePlan.laneSequence[0];
  const last = input.routePlan.laneSequence[input.routePlan.laneSequence.length - 1];

  if (first.nodeId !== input.originNodeId) {
    return {
      ok: false,
      reason: "Route plan does not start at origin.",
    };
  }

  if (last.nodeId !== input.destinationNodeId) {
    return {
      ok: false,
      reason: "Route plan does not end at destination.",
    };
  }

  const nodeIds = new Set(input.availableNodes.map((x) => x.nodeId));

  for (const leg of input.routePlan.laneSequence) {
    if (!nodeIds.has(leg.nodeId)) {
      return {
        ok: false,
        reason: `Unknown node in route: ${leg.nodeId}.`,
      };
    }
  }

  return {
    ok: true,
    reason: "Route plan valid.",
  };
}