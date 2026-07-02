import type {
  EnergyEconomicsArtifact,
  EnergyEconomicsInput,
  EnergyEconomicsResult,
} from "./energyEconomicsTypes.js";
import {
  classifyCognitiveLoad,
  classifyDepletionRisk,
  classifyStabilityBalance,
  clamp01,
  nowIso,
} from "./energyEconomicsUtils.js";

export function runEnergyEconomics(
  input: EnergyEconomicsInput,
): EnergyEconomicsResult {
  if (input.timeMinutes < 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_TIME",
        refusalReason: "Energy economics refused because timeMinutes cannot be negative.",
      },
    };
  }

  if (input.waitingMinutes < 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_WAIT",
        refusalReason: "Energy economics refused because waitingMinutes cannot be negative.",
      },
    };
  }

  if (
    input.ambiguityScore < 0 ||
    input.ambiguityScore > 1
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_SCORE",
        refusalReason: "Energy economics refused because ambiguityScore must be between 0 and 1.",
      },
    };
  }

  const timeCostScore = clamp01(
    input.timeMinutes / 240 + input.waitingMinutes / 120
  );

  const cognitiveLoadScore = clamp01(
    input.ambiguityScore * 0.35 +
    Math.min(1, input.decisionCount / 12) * 0.35 +
    Math.min(1, input.handoffCount / 8) * 0.3
  );

  const depletionRiskScore = clamp01(
    timeCostScore * 0.35 +
    cognitiveLoadScore * 0.35 +
    Math.min(1, input.reworkCount / 6) * 0.2 +
    Math.min(1, input.waitingMinutes / 90) * 0.1
  );

  const energyCostScore = clamp01(
    timeCostScore * 0.45 +
    cognitiveLoadScore * 0.35 +
    depletionRiskScore * 0.2
  );

  const savedEnergyScore = clamp01(1 - energyCostScore);

  const balanceScore = clamp01(
    1 -
    (
      timeCostScore * 0.35 +
      cognitiveLoadScore * 0.35 +
      depletionRiskScore * 0.3
    )
  );

  const artifact: EnergyEconomicsArtifact = {
    subjectId: input.subjectId,
    translation: {
      timeCostScore,
      energyCostScore,
      savedEnergyScore,
    },
    cognitiveLoad: {
      cognitiveLoadClass: classifyCognitiveLoad(cognitiveLoadScore),
      cognitiveLoadScore,
    },
    depletion: {
      depletionRiskClass: classifyDepletionRisk(depletionRiskScore),
      depletionRiskScore,
    },
    stability: {
      stabilityBalanceClass: classifyStabilityBalance(balanceScore),
      balanceScore,
    },
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}