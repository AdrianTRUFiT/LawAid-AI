import type {
  CheckpointValuationResult,
  MarketCheckpointValuationInput,
  PremiumJudgment,
  ValuationFlag,
} from "./valuationTypes.js";
import { computeBurdenScore } from "./burdenScoring.js";
import { computePressureScore } from "./pressureScoring.js";
import { buildFairValueRange } from "./fairValueEngine.js";
import { computeHoldNodeStrategicValue } from "./holdNodeValuation.js";
import { makeId, round2 } from "./valuationUtils.js";

function buildFlags(input: {
  premiumJudgment: PremiumJudgment;
  burdenScore: number;
  pressureScore: number;
  holdNodeStrategicValue: number;
  proposedCharge: number;
  fairValueMin: number;
  fairValueMax: number;
}): ValuationFlag[] {
  const flags: ValuationFlag[] = [];

  if (input.pressureScore >= 55) {
    flags.push({
      flagId: makeId("flag"),
      category: "pressure",
      severity: input.pressureScore >= 75 ? "high" : "medium",
      message: `Market pressure elevated at ${input.pressureScore}.`,
    });
  }

  if (input.burdenScore >= 45) {
    flags.push({
      flagId: makeId("flag"),
      category: "burden",
      severity: input.burdenScore >= 65 ? "high" : "medium",
      message: `Checkpoint burden elevated at ${input.burdenScore}.`,
    });
  }

  if (input.holdNodeStrategicValue >= 35) {
    flags.push({
      flagId: makeId("flag"),
      category: "hold_node",
      severity: input.holdNodeStrategicValue >= 55 ? "high" : "medium",
      message: `Hold-node strategic value meaningful at ${input.holdNodeStrategicValue}.`,
    });
  }

  if (input.premiumJudgment === "JUSTIFIED_PREMIUM") {
    flags.push({
      flagId: makeId("flag"),
      category: "premium",
      severity: "medium",
      message: "Premium appears justified by burden, pressure, or continuity need.",
    });
  }

  if (input.premiumJudgment === "INFLATED_EXTRACTION") {
    flags.push({
      flagId: makeId("flag"),
      category: "inflation",
      severity: "high",
      message: `Proposed charge ${input.proposedCharge} exceeds reasonable range ${input.fairValueMax}.`,
    });
  }

  if (input.proposedCharge < input.fairValueMin) {
    flags.push({
      flagId: makeId("flag"),
      category: "continuity",
      severity: "low",
      message: "Proposed charge is below reasonable range; quality or continuity may be under-supported.",
    });
  }

  return flags;
}

export function evaluateCheckpointValuation(
  input: MarketCheckpointValuationInput,
): CheckpointValuationResult {
  const burdenScore = computeBurdenScore(input.checkpoint);
  const pressureScore = computePressureScore(input.route);
  const holdNodeStrategicValue = computeHoldNodeStrategicValue(input.holdNode);
  const fairValueRange = buildFairValueRange(input);

  let premiumJudgment: PremiumJudgment = "STANDARD_RANGE";

  if (input.proposedCharge > fairValueRange.maximumReasonable) {
    premiumJudgment = "INFLATED_EXTRACTION";
  } else if (input.proposedCharge > fairValueRange.marketClearedEstimate) {
    premiumJudgment = "JUSTIFIED_PREMIUM";
  }

  const justifiedPremiumAmount =
    premiumJudgment === "JUSTIFIED_PREMIUM"
      ? round2(input.proposedCharge - fairValueRange.marketClearedEstimate)
      : 0;

  const inflationAmount =
    premiumJudgment === "INFLATED_EXTRACTION"
      ? round2(input.proposedCharge - fairValueRange.maximumReasonable)
      : 0;

  const flags = buildFlags({
    premiumJudgment,
    burdenScore,
    pressureScore,
    holdNodeStrategicValue,
    proposedCharge: input.proposedCharge,
    fairValueMin: fairValueRange.minimumReasonable,
    fairValueMax: fairValueRange.maximumReasonable,
  });

  const rationale: string[] = [
    `Burden score = ${burdenScore}.`,
    `Pressure score = ${pressureScore}.`,
    `Hold-node strategic value = ${holdNodeStrategicValue}.`,
    `Fair value estimate = ${fairValueRange.marketClearedEstimate} ${fairValueRange.currency}.`,
  ];

  if (premiumJudgment === "JUSTIFIED_PREMIUM") {
    rationale.push("Premium classified as justified by current burden/pressure conditions.");
  }

  if (premiumJudgment === "INFLATED_EXTRACTION") {
    rationale.push("Proposed charge exceeds maximum reasonable range and is flagged as inflation.");
  }

  return {
    routeId: input.route.routeId,
    checkpointId: input.checkpoint.checkpointId,
    fairValueRange,
    proposedCharge: input.proposedCharge,
    premiumJudgment,
    justifiedPremiumAmount,
    inflationAmount,
    burdenScore,
    pressureScore,
    holdNodeStrategicValue,
    flags,
    rationale,
  };
}