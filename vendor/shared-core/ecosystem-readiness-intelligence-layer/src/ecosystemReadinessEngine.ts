import type {
  EcosystemReadinessArtifact,
  EcosystemReadinessInput,
  EcosystemReadinessResult,
  EcosystemReadinessStatus,
} from "./ecosystemReadinessTypes.js";
import {
  getMaxLayer,
  getMinLayer,
  makeEcosystemReadinessId,
  nowIso,
} from "./ecosystemReadinessUtils.js";

export function runEcosystemReadinessIntelligence(
  input: EcosystemReadinessInput,
): EcosystemReadinessResult {
  const scores = [
    input.energyScore,
    input.waterWasteScore,
    input.shelterScore,
    input.productionScore,
    input.mobilityScore,
    input.foodScore,
    input.healthSafetyScore,
    input.governanceScore,
  ];

  if (scores.some((s) => !Number.isFinite(s) || s < 0 || s > 1)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_SCORE",
        refusalReason: "Ecosystem readiness intelligence refused because one or more layer scores are invalid.",
      },
    };
  }

  const readinessCompositeScore =
    (
      input.energyScore +
      input.waterWasteScore +
      input.shelterScore +
      input.productionScore +
      input.mobilityScore +
      input.foodScore +
      input.healthSafetyScore +
      input.governanceScore
    ) / 8;

  let ecosystemReadinessStatus: EcosystemReadinessStatus;
  if (readinessCompositeScore >= 0.75) {
    ecosystemReadinessStatus = "READINESS_HIGH";
  } else if (readinessCompositeScore >= 0.45) {
    ecosystemReadinessStatus = "READINESS_TRANSITIONAL";
  } else {
    ecosystemReadinessStatus = "READINESS_LOW";
  }

  const keyedScores = {
    energy: input.energyScore,
    water_waste: input.waterWasteScore,
    shelter: input.shelterScore,
    production: input.productionScore,
    mobility: input.mobilityScore,
    food: input.foodScore,
    health_safety: input.healthSafetyScore,
    governance: input.governanceScore,
  };

  const strongestLayer = getMaxLayer(keyedScores) as EcosystemReadinessArtifact["strongestLayer"];
  const weakestLayer = getMinLayer(keyedScores) as EcosystemReadinessArtifact["weakestLayer"];

  const artifact: EcosystemReadinessArtifact = {
    ecosystemReadinessId: makeEcosystemReadinessId(input.subjectId),
    subjectId: input.subjectId,
    settlementType: input.settlementType,
    ecosystemReadinessStatus,
    readinessCompositeScore,
    strongestLayer,
    weakestLayer,
    reason: "Settlement profile interpreted into governed ecosystem-readiness state.",
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}