import type {
  CandidateRoute,
  NormalizedSearchQuery,
  RouteMode,
} from "./logisticsSearchTypes.js";
import { makeId, round2 } from "./logisticsSearchUtils.js";

function baseCandidates(query: NormalizedSearchQuery): CandidateRoute[] {
  const sizeFactor = query.weightKg * 0.02 + query.volumeM3 * 5;
  const urgencyFactor = query.urgencyScore * 0.1;

  const routes: CandidateRoute[] = [
    {
      routeId: makeId("route"),
      origin: query.origin,
      destination: query.destination,
      mode: "truck",
      estimatedHours: round2(18 - urgencyFactor * 0.05 + sizeFactor * 0.03),
      estimatedCost: round2(180 + sizeFactor * 1.2),
      delayRiskScore: 42,
      checkpointBurdenScore: 28,
      holdNodeBenefitScore: 22,
      protectionFitScore: 68,
      netValueScore: 71,
    },
    {
      routeId: makeId("route"),
      origin: query.origin,
      destination: query.destination,
      mode: "air",
      estimatedHours: round2(6 - urgencyFactor * 0.03 + sizeFactor * 0.015),
      estimatedCost: round2(420 + sizeFactor * 2.1),
      delayRiskScore: 35,
      checkpointBurdenScore: 34,
      holdNodeBenefitScore: 12,
      protectionFitScore: 82,
      netValueScore: 78,
    },
    {
      routeId: makeId("route"),
      origin: query.origin,
      destination: query.destination,
      mode: "rail",
      estimatedHours: round2(24 - urgencyFactor * 0.02 + sizeFactor * 0.025),
      estimatedCost: round2(150 + sizeFactor * 1.0),
      delayRiskScore: 30,
      checkpointBurdenScore: 26,
      holdNodeBenefitScore: 30,
      protectionFitScore: 73,
      netValueScore: 76,
    },
    {
      routeId: makeId("route"),
      origin: query.origin,
      destination: query.destination,
      mode: "mixed",
      estimatedHours: round2(14 - urgencyFactor * 0.025 + sizeFactor * 0.02),
      estimatedCost: round2(240 + sizeFactor * 1.4),
      delayRiskScore: 27,
      checkpointBurdenScore: 32,
      holdNodeBenefitScore: 38,
      protectionFitScore: 80,
      netValueScore: 84,
    },
  ];

  return routes;
}

export function buildCandidateRoutes(
  query: NormalizedSearchQuery,
): CandidateRoute[] {
  const all = baseCandidates(query);

  let filtered = all;

  if (query.preferredModes.length > 0) {
    filtered = filtered.filter((x) => query.preferredModes.includes(x.mode));
  }

  if (query.budgetLimit !== null) {
    filtered = filtered.filter((x) => x.estimatedCost <= query.budgetLimit!);
  }

  if (query.maxDelayRisk !== null) {
    filtered = filtered.filter((x) => x.delayRiskScore <= query.maxDelayRisk!);
  }

  return filtered.length > 0 ? filtered : all;
}