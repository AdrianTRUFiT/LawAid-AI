import type {
  AdaptiveConversionPlanArtifact,
  AdaptiveConversionPlanInput,
  AdaptiveConversionPlanResult,
  AdaptiveConversionPlanStatus,
} from "./adaptiveConversionPlanTypes.js";
import {
  makeAdaptiveConversionPlanId,
  nowIso,
} from "./adaptiveConversionPlanUtils.js";

export function runAdaptiveConversionPlanBridge(
  input: AdaptiveConversionPlanInput,
): AdaptiveConversionPlanResult {
  if (!input.ecosystemReadiness || !input.adaptiveGap) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Adaptive conversion plan bridge refused because readiness or adaptive-gap input is missing.",
      },
    };
  }

  if (
    input.subjectId !== input.ecosystemReadiness.subjectId ||
    input.subjectId !== input.adaptiveGap.subjectId
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Adaptive conversion plan bridge refused because subject identity does not match across inputs.",
      },
    };
  }

  let adaptiveConversionPlanStatus: AdaptiveConversionPlanStatus;
  switch (input.adaptiveGap.conversionPriority) {
    case "high":
      adaptiveConversionPlanStatus = "CONVERSION_PLAN_HIGH_PRIORITY";
      break;
    case "medium":
      adaptiveConversionPlanStatus = "CONVERSION_PLAN_MEDIUM_PRIORITY";
      break;
    default:
      adaptiveConversionPlanStatus = "CONVERSION_PLAN_LOW_PRIORITY";
      break;
  }

  let primaryConversionTrack: AdaptiveConversionPlanArtifact["primaryConversionTrack"];
  let firstMove = "";

  switch (input.adaptiveGap.ownershipLayer) {
    case "sensor":
      primaryConversionTrack = "sensor_instrumentation";
      firstMove = "Install field instrumentation, sensors, and monitoring packages in the weakest layer first.";
      break;
    case "machine":
      primaryConversionTrack = "machine_automation";
      firstMove = "Build automation workflows, scheduling logic, and routing controls around the weakest layer first.";
      break;
    case "hybrid":
      primaryConversionTrack = "hybrid_exception_layer";
      firstMove = "Stand up anomaly interpretation, audit verification, and exception routing around the weakest layer first.";
      break;
    default:
      primaryConversionTrack = "human_governance_layer";
      firstMove = "Establish governance, override authority, and accountability surfaces around the weakest layer first.";
      break;
  }

  const artifact: AdaptiveConversionPlanArtifact = {
    adaptiveConversionPlanId: makeAdaptiveConversionPlanId(input.subjectId),
    subjectId: input.subjectId,
    adaptiveConversionPlanStatus,
    settlementType: input.ecosystemReadiness.settlementType,
    primaryConversionTrack,
    firstMove,
    reason: "Readiness and adaptive-gap intelligence converted into a governed ecosystem-conversion plan artifact.",
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}