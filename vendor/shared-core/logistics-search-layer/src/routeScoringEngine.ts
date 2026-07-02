import type {
  CandidateRoute,
  NormalizedSearchQuery,
  SearchObjective,
} from "./logisticsSearchTypes.js";
import { round2 } from "./logisticsSearchUtils.js";

export function scoreRoute(input: {
  route: CandidateRoute;
  query: NormalizedSearchQuery;
}): number {
  const route = input.route;
  const objective = input.query.objective;

  const speedScore = 100 - route.estimatedHours * 3;
  const costScore = 100 - route.estimatedCost * 0.12;
  const riskScore = 100 - route.delayRiskScore;
  const burdenScore = 100 - route.checkpointBurdenScore;
  const holdScore = route.holdNodeBenefitScore;
  const protectionScore = route.protectionFitScore;
  const netValueScore = route.netValueScore;

  let total = 0;

  if (objective === "fastest") {
    total =
      speedScore * 0.4 +
      riskScore * 0.18 +
      protectionScore * 0.14 +
      netValueScore * 0.14 +
      costScore * 0.08 +
      holdScore * 0.06;
  } else if (objective === "cheapest") {
    total =
      costScore * 0.38 +
      riskScore * 0.18 +
      burdenScore * 0.14 +
      netValueScore * 0.14 +
      speedScore * 0.08 +
      holdScore * 0.08;
  } else {
    total =
      speedScore * 0.2 +
      costScore * 0.2 +
      riskScore * 0.16 +
      burdenScore * 0.1 +
      holdScore * 0.08 +
      protectionScore * 0.12 +
      netValueScore * 0.14;
  }

  return round2(total);
}