import type {
  FairValueRange,
  MarketCheckpointValuationInput,
} from "./valuationTypes.js";
import { computeBurdenScore } from "./burdenScoring.js";
import { computePressureScore } from "./pressureScoring.js";
import { computeHoldNodeStrategicValue } from "./holdNodeValuation.js";
import { round2 } from "./valuationUtils.js";

export function buildFairValueRange(
  input: MarketCheckpointValuationInput,
): FairValueRange {
  const burdenScore = computeBurdenScore(input.checkpoint);
  const pressureScore = computePressureScore(input.route);
  const holdNodeStrategicValue = computeHoldNodeStrategicValue(input.holdNode);

  const routeBase =
    input.route.distanceKm * 0.04 +
    input.route.weightKg * 0.015 +
    input.route.volumeM3 * 2.5;

  const minimumReasonable = round2(
    routeBase + burdenScore * 0.18 + holdNodeStrategicValue * 0.08,
  );

  const marketClearedEstimate = round2(
    minimumReasonable + pressureScore * 0.22 + holdNodeStrategicValue * 0.1,
  );

  const maximumReasonable = round2(
    marketClearedEstimate + burdenScore * 0.2 + pressureScore * 0.12,
  );

  return {
    minimumReasonable,
    marketClearedEstimate,
    maximumReasonable,
    currency: input.currency,
  };
}