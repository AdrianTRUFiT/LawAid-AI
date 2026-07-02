import type {
  LogisticsSearchResponse,
  NormalizedSearchQuery,
  RankedRoute,
} from "./logisticsSearchTypes.js";

export function buildSearchResponse(input: {
  query: NormalizedSearchQuery;
  rankedRoutes: RankedRoute[];
}): LogisticsSearchResponse {
  const rankedRoutes = input.rankedRoutes;

  const fastestRoute = [...rankedRoutes].sort((a, b) => a.estimatedHours - b.estimatedHours)[0];
  const cheapestRoute = [...rankedRoutes].sort((a, b) => a.estimatedCost - b.estimatedCost)[0];
  const bestBalancedRoute = rankedRoutes[0];

  return {
    queryId: input.query.queryId,
    objective: input.query.objective,
    fastestRoute,
    cheapestRoute,
    bestBalancedRoute,
    rankedRoutes,
    generatedAt: new Date().toISOString(),
  };
}