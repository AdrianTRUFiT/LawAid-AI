import type {
  OptimizationRecommendation,
  TransportOptimizationInput,
  TransportOptimizationResult,
} from "./optimizationTypes.js";
import { buildBackhaulRecommendations } from "./backhaulMatcher.js";
import { buildBottleneckRecommendations, buildBottleneckSnapshots } from "./bottleneckAnalyzer.js";
import { buildDwellRecommendations, buildDwellSnapshots } from "./dwellAnalyzer.js";
import { buildFillRateRecommendations, buildFillRateSnapshots } from "./fillRateOptimizer.js";
import { buildRouteStressRecommendations, buildRouteStressSnapshots } from "./routeStressAnalyzer.js";

export function runTransportOptimizationReserve(
  input: TransportOptimizationInput,
): TransportOptimizationResult {
  const fillRates = buildFillRateSnapshots(input);
  const dwellSnapshots = buildDwellSnapshots(input);
  const routeStress = buildRouteStressSnapshots(input);
  const bottlenecks = buildBottleneckSnapshots(input);

  if (input.mode === "disabled") {
    return {
      mode: input.mode,
      recommendations: [],
      fillRates: [],
      dwellSnapshots: [],
      routeStress: [],
      bottlenecks: [],
      recommendationCount: 0,
      optimizerApplied: false,
    };
  }

  const recommendations: OptimizationRecommendation[] = [
    ...buildFillRateRecommendations(fillRates),
    ...buildDwellRecommendations(dwellSnapshots),
    ...buildRouteStressRecommendations(routeStress),
    ...buildBottleneckRecommendations(bottlenecks),
    ...buildBackhaulRecommendations(input),
  ];

  return {
    mode: input.mode,
    recommendations,
    fillRates,
    dwellSnapshots,
    routeStress,
    bottlenecks,
    recommendationCount: recommendations.length,
    optimizerApplied: true,
  };
}