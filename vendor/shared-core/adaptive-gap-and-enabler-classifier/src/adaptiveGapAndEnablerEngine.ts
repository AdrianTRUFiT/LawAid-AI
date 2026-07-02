import type {
  AdaptiveGapAndEnablerArtifact,
  AdaptiveGapAndEnablerInput,
  AdaptiveGapAndEnablerResult,
  MissingEnablerClass,
  OwnershipLayer,
} from "./adaptiveGapAndEnablerTypes.js";
import {
  makeAdaptiveGapId,
  nowIso,
} from "./adaptiveGapAndEnablerUtils.js";

export function runAdaptiveGapAndEnablerClassifier(
  input: AdaptiveGapAndEnablerInput,
): AdaptiveGapAndEnablerResult {
  if (!input.ecosystemReadiness) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Adaptive gap and enabler classifier refused because ecosystem readiness input is missing.",
      },
    };
  }

  if (input.subjectId !== input.ecosystemReadiness.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Adaptive gap and enabler classifier refused because subject identity does not match ecosystem readiness input.",
      },
    };
  }

  let ownershipLayer: OwnershipLayer = "machine";
  let missingEnablerClass: MissingEnablerClass = "balanced";

  switch (input.ecosystemReadiness.weakestLayer) {
    case "energy":
    case "water_waste":
      ownershipLayer = "sensor";
      missingEnablerClass = "sensor_package";
      break;

    case "mobility":
    case "production":
      ownershipLayer = "machine";
      missingEnablerClass = "automation_workflow";
      break;

    case "health_safety":
    case "food":
      ownershipLayer = "hybrid";
      missingEnablerClass = "anomaly_resolution";
      break;

    case "governance":
    case "shelter":
      ownershipLayer = "human";
      missingEnablerClass = "governance_override";
      break;
  }

  const conversionPriority =
    input.ecosystemReadiness.ecosystemReadinessStatus === "READINESS_LOW"
      ? "high"
      : input.ecosystemReadiness.ecosystemReadinessStatus === "READINESS_TRANSITIONAL"
      ? "medium"
      : "low";

  const artifact: AdaptiveGapAndEnablerArtifact = {
    adaptiveGapId: makeAdaptiveGapId(input.subjectId),
    subjectId: input.subjectId,
    ownershipLayer,
    missingEnablerClass,
    weakestLayer: input.ecosystemReadiness.weakestLayer,
    conversionPriority,
    reason: "Ecosystem readiness translated into missing-enabler and ownership-layer intelligence.",
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}