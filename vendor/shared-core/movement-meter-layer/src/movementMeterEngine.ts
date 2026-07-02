import type {
  ActionWindow,
  MovementMeterArtifact,
  MovementMeterInput,
  MovementMeterResult,
} from "./movementMeterTypes.js";
import {
  deriveHazardClass,
  deriveMaturityClass,
  deriveViabilityClass,
  expectedStaticTimeFromPnn,
  normalizeDirection,
  normalizeStateLabel,
  nowIso,
} from "./movementMeterUtils.js";

export function runMovementMeter(
  input: MovementMeterInput,
): MovementMeterResult {
  if (input.ageBars < 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_AGE",
        refusalReason: "Movement meter refused because ageBars cannot be negative.",
      },
    };
  }

  const direction = normalizeDirection(input.direction);

  if (direction === "unknown" && input.direction !== "unknown") {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_DIRECTION",
        refusalReason: "Movement meter refused because direction is invalid.",
      },
    };
  }

  const movementState = normalizeStateLabel(input.stateLabel);

  if (movementState === "unknown_state") {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_STATE_LABEL",
        refusalReason: "Movement meter refused because stateLabel is invalid.",
      },
    };
  }

  const anomalyScore = typeof input.anomalyScore === "number" ? input.anomalyScore : 0;
  const maturityClass = deriveMaturityClass(movementState, input.ageBars);
  const viabilityClass = deriveViabilityClass(input.ageBars, anomalyScore);
  const hazardClass = deriveHazardClass(input.ageBars, anomalyScore, maturityClass);

  const continuationImplausibility =
    Math.min(1, (input.ageBars / 20) + anomalyScore * 0.5 + (hazardClass === "high" ? 0.25 : 0));

  const remainingRunwayBars =
    Math.max(0, Math.round(20 - input.ageBars - anomalyScore * 5));

  const hazardScore =
    Math.min(1, input.ageBars * 0.05 + anomalyScore + (maturityClass === "exhaustion_risk" ? 0.25 : 0));

  const actionWindow: ActionWindow =
    hazardClass === "low"
      ? { status: "open", reason: "Movement remains early or stable enough for action." }
      : hazardClass === "guarded"
        ? { status: "narrowing", reason: "Movement is developing and requires attention." }
        : hazardClass === "elevated"
          ? { status: "closing", reason: "Movement is aging and continuation risk is rising." }
          : { status: "closed", reason: "Movement is at high hazard or exhaustion risk." };

  const artifact: MovementMeterArtifact = {
    subjectId: input.subjectId,
    movementState,
    direction,
    stateAge: {
      ageBars: input.ageBars,
      expectedStaticTime: expectedStaticTimeFromPnn(input.p_nn),
    },
    viabilityEnvelope: {
      viabilityClass,
      remainingRunwayBars,
      continuationImplausibility,
    },
    transitionHazard: {
      hazardClass,
      hazardScore,
    },
    maturityClass,
    actionWindow,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}