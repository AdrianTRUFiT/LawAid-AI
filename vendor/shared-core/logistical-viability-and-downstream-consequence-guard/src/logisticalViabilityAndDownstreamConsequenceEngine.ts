import type {
  LogisticalViabilityArtifact,
  LogisticalViabilityInput,
  LogisticalViabilityResult,
  LogisticalViabilityStatus,
} from "./logisticalViabilityAndDownstreamConsequenceTypes.js";
import {
  makeLogisticalViabilityId,
  nowIso,
} from "./logisticalViabilityAndDownstreamConsequenceUtils.js";

export function runLogisticalViabilityAndDownstreamConsequenceGuard(
  input: LogisticalViabilityInput,
): LogisticalViabilityResult {
  if (!input.enablerDemand) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Logistical viability guard refused because enabler-demand input is missing.",
      },
    };
  }

  if (input.subjectId !== input.enablerDemand.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Logistical viability guard refused because subject identity does not match enabler-demand input.",
      },
    };
  }

  const scores = [
    input.upstreamDependencyScore,
    input.economicViabilityScore,
    input.downstreamConsequenceScore,
    input.engagementDurabilityScore,
  ];

  if (scores.some((s) => !Number.isFinite(s) || s < 0 || s > 1)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_SCORE",
        refusalReason: "Logistical viability guard refused because one or more scores are invalid.",
      },
    };
  }

  const viabilityCompositeScore =
    (
      input.upstreamDependencyScore +
      input.economicViabilityScore +
      input.downstreamConsequenceScore +
      input.engagementDurabilityScore
    ) / 4;

  let logisticalViabilityStatus: LogisticalViabilityStatus;
  let advanceRecommendation: LogisticalViabilityArtifact["advanceRecommendation"];
  let reason = "";

  if (input.upstreamDependencyScore < 0.35) {
    logisticalViabilityStatus = "REFUSED_UPSTREAM";
    advanceRecommendation = "refuse";
    reason = "Upstream dependency conditions are too weak for chain-sound opportunity.";
  } else if (input.economicViabilityScore < 0.5) {
    logisticalViabilityStatus = "HELD_ECONOMICALLY";
    advanceRecommendation = "hold";
    reason = "Economic reality is too weak, so opportunity remains held.";
  } else if (input.downstreamConsequenceScore < 0.5 || input.engagementDurabilityScore < 0.5) {
    logisticalViabilityStatus = "HELD_DOWNSTREAM";
    advanceRecommendation = "hold";
    reason = "Downstream or engagement conditions are too weak, so opportunity remains held.";
  } else {
    logisticalViabilityStatus = "CHAIN_SOUND_OPPORTUNITY";
    advanceRecommendation = "advance";
    reason = "Upstream, economic, downstream, and engagement conditions support chain-sound opportunity.";
  }

  const artifact: LogisticalViabilityArtifact = {
    logisticalViabilityId: makeLogisticalViabilityId(input.subjectId),
    subjectId: input.subjectId,
    logisticalViabilityStatus,
    viabilityCompositeScore,
    advanceRecommendation,
    reason,
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}