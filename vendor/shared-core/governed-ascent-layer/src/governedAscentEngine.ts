import type {
  AscentArtifact,
  AscentInput,
  GovernedAscentResult,
} from "./governedAscentTypes.js";
import {
  dominantPressure,
  getStageWeight,
  isLegalProgression,
  nowIso,
  totalPressureScore,
} from "./governedAscentUtils.js";

export function runGovernedAscent(
  input: AscentInput,
): GovernedAscentResult {
  const lawfulProgression = isLegalProgression(input.currentStage, input.targetStage);

  if (input.lawfulProgressionRequired !== false && !lawfulProgression) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "ILLEGAL_STAGE_JUMP",
        refusalReason: "Governed ascent refused because target stage is not the next lawful layer.",
      },
    };
  }

  if (input.hazardClass === "high" && input.targetStage !== input.currentStage) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "HIGH_HAZARD_BLOCK",
        refusalReason: "Governed ascent refused because hazard is too high for ascent.",
      },
    };
  }

  const totalPressure = totalPressureScore(input.pressureProfile);

  if (totalPressure >= 0.9) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "PRESSURE_OVERLOAD",
        refusalReason: "Governed ascent refused because total pressure is beyond safe ascent threshold.",
      },
    };
  }

  const currentWeight = getStageWeight(input.currentStage);
  const targetWeight = getStageWeight(input.targetStage);
  const narrowingDelta = targetWeight - currentWeight;

  let decision: "ASCEND" | "HOLD" | "REFUSE" = "ASCEND";
  let reason = "Lawful ascent permitted.";

  if (
    input.hazardClass === "elevated" ||
    input.pressureClass === "elevated" ||
    totalPressure >= 0.7 ||
    input.movementMaturityClass === "exhaustion_risk"
  ) {
    decision = "HOLD";
    reason = "Ascent held because pressure or maturity risk suggests stabilization first.";
  }

  const artifact: AscentArtifact = {
    subjectId: input.subjectId,
    currentStage: input.currentStage,
    targetStage: input.targetStage,
    decision,
    totalPressureScore: totalPressure,
    dominantPressure: dominantPressure(input.pressureProfile),
    narrowingProfile: {
      currentStageWeight: currentWeight,
      targetStageWeight: targetWeight,
      narrowingDelta,
    },
    lawfulProgression,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}