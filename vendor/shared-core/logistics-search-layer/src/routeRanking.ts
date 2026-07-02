import type {
  CandidateRoute,
  NormalizedSearchQuery,
  RankedRoute,
} from "./logisticsSearchTypes.js";
import { scoreRoute } from "./routeScoringEngine.js";

function buildTags(input: {
  route: CandidateRoute;
  fastestHours: number;
  cheapestCost: number;
  highestNetValue: number;
}): string[] {
  const tags: string[] = [];

  if (input.route.estimatedHours === input.fastestHours) {
    tags.push("fastest");
  }

  if (input.route.estimatedCost === input.cheapestCost) {
    tags.push("cheapest");
  }

  if (input.route.netValueScore === input.highestNetValue) {
    tags.push("best-net-value");
  }

  if (input.route.delayRiskScore <= 30) {
    tags.push("low-risk");
  }

  if (input.route.protectionFitScore >= 80) {
    tags.push("best-protected");
  }

  return tags;
}

export function rankRoutes(input: {
  routes: CandidateRoute[];
  query: NormalizedSearchQuery;
}): RankedRoute[] {
  const fastestHours = Math.min(...input.routes.map((x) => x.estimatedHours));
  const cheapestCost = Math.min(...input.routes.map((x) => x.estimatedCost));
  const highestNetValue = Math.max(...input.routes.map((x) => x.netValueScore));

  return input.routes
    .map((route) => {
      const totalScore = scoreRoute({
        route,
        query: input.query,
      });

      const tags = buildTags({
        route,
        fastestHours,
        cheapestCost,
        highestNetValue,
      });

      return {
        ...route,
        rank: 0,
        totalScore,
        tags,
        rankReason: `Ranked by ${input.query.objective} objective using time, cost, risk, burden, protection, and net value.`,
      } satisfies RankedRoute;
    })
    .sort((a, b) => b.totalScore - a.totalScore)
    .map((route, index) => ({
      ...route,
      rank: index + 1,
    }));
}