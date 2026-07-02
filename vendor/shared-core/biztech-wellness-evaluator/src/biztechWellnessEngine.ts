import type {
  BizTechWellnessArtifact,
  BizTechWellnessInput,
  BizTechWellnessResult,
} from "./biztechWellnessTypes.js";
import {
  clamp01,
  nowIso,
  recommendationFromComposite,
} from "./biztechWellnessUtils.js";

export function runBizTechWellnessEvaluation(
  input: BizTechWellnessInput,
): BizTechWellnessResult {
  if (!input.ascent) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_ASCENT",
        refusalReason: "BizTech Wellness evaluation refused because ascent artifact is missing.",
      },
    };
  }

  if (!input.energy) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_ENERGY",
        refusalReason: "BizTech Wellness evaluation refused because energy artifact is missing.",
      },
    };
  }

  if (
    input.subjectId !== input.ascent.subjectId ||
    input.subjectId !== input.energy.subjectId
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "BizTech Wellness evaluation refused because subjectIds do not align.",
      },
    };
  }

  const businessScore = clamp01(
    (input.ascent.decision === "ASCEND" ? 0.9 : input.ascent.decision === "HOLD" ? 0.55 : 0.1) * 0.45 +
    (1 - input.ascent.totalPressureScore) * 0.35 +
    (1 - Math.min(1, input.ascent.narrowingProfile.narrowingDelta / 3)) * 0.2
  );

  const technologyScore = clamp01(
    (input.ascent.lawfulProgression ? 1 : 0) * 0.55 +
    (input.ascent.decision === "REFUSE" ? 0.4 : 0.9) * 0.15 +
    (input.ascent.dominantPressure === "layers" ? 0.75 : 0.9) * 0.1 +
    (1 - input.ascent.totalPressureScore) * 0.2
  );

  const wellnessScore = clamp01(
    input.energy.translation.savedEnergyScore * 0.4 +
    input.energy.stability.balanceScore * 0.35 +
    (1 - input.energy.depletion.depletionRiskScore) * 0.25
  );

  const compositeScore = clamp01(
    businessScore * 0.34 +
    technologyScore * 0.33 +
    wellnessScore * 0.33
  );

  const reasonSet: string[] = [];

  if (businessScore >= 0.7) {
    reasonSet.push("Business path retains usable movement value.");
  } else {
    reasonSet.push("Business path is carrying meaningful friction or consequence drag.");
  }

  if (technologyScore >= 0.7) {
    reasonSet.push("Technology path remains lawful and bounded.");
  } else {
    reasonSet.push("Technology path is structurally weak or pressure-heavy.");
  }

  if (wellnessScore >= 0.7) {
    reasonSet.push("Wellness path preserves usable energy and stability.");
  } else {
    reasonSet.push("Wellness path is consuming stability or increasing depletion risk.");
  }

  const artifact: BizTechWellnessArtifact = {
    subjectId: input.subjectId,
    businessScore,
    technologyScore,
    wellnessScore,
    compositeScore,
    recommendation: recommendationFromComposite(compositeScore),
    reasonSet,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}