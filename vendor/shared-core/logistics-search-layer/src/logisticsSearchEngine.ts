import type {
  LogisticsSearchQuery,
  LogisticsSearchResponse,
} from "./logisticsSearchTypes.js";
import { buildCandidateRoutes } from "./candidateRouteBuilder.js";
import { normalizeSearchQuery } from "./queryNormalizer.js";
import { rankRoutes } from "./routeRanking.js";
import { buildSearchResponse } from "./searchResponseBuilder.js";

export function runLogisticsSearch(
  query: LogisticsSearchQuery,
): LogisticsSearchResponse {
  const normalized = normalizeSearchQuery(query);
  const candidates = buildCandidateRoutes(normalized);
  const ranked = rankRoutes({
    routes: candidates,
    query: normalized,
  });

  return buildSearchResponse({
    query: normalized,
    rankedRoutes: ranked,
  });
}