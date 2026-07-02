import type {
  QualityPreservationGateArtifact,
  QualityPreservationGateInput,
  QualityPreservationGateResult,
  QualityGateStatus,
} from "./qualityPreservationGateTypes.js";
import {
  makeQualityGateId,
  nowIso,
} from "./qualityPreservationGateUtils.js";

export function runQualityPreservationGate(
  input: QualityPreservationGateInput,
): QualityPreservationGateResult {
  if (!input.inquiryIntelligence || !input.poolingThreshold) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Quality preservation gate refused because inquiry intelligence or pooling threshold input is missing.",
      },
    };
  }

  if (
    input.subjectId !== input.inquiryIntelligence.subjectId ||
    input.subjectId !== input.poolingThreshold.subjectId
  ) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Quality preservation gate refused because subject identity does not match across inputs.",
      },
    };
  }

  const scores = [input.qualityScore, input.providerReliabilityScore];
  if (scores.some((s) => !Number.isFinite(s) || s < 0 || s > 1)) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_SCORE",
        refusalReason: "Quality preservation gate refused because one or more quality scores are invalid.",
      },
    };
  }

  const qualityCompositeScore =
    (input.qualityScore * 0.6) +
    (input.providerReliabilityScore * 0.4);

  let qualityGateStatus: QualityGateStatus;
  let releaseSafe = false;
  let reason = "";

  if (qualityCompositeScore < 0.35) {
    qualityGateStatus = "QUALITY_REFUSED";
    reason = "Quality composite score is too weak to preserve acceptable downstream quality.";
  } else if (qualityCompositeScore < 0.7) {
    qualityGateStatus = "QUALITY_HELD";
    reason = "Quality composite score suggests review or comparison before release.";
  } else {
    qualityGateStatus = "QUALITY_PASSED";
    releaseSafe = true;
    reason = "Quality conditions are strong enough to preserve acceptable downstream quality.";
  }

  if (
    input.poolingThreshold.poolingStatus === "POOLING_PENDING" &&
    qualityGateStatus === "QUALITY_PASSED"
  ) {
    releaseSafe = false;
    reason = "Quality passed, but pooling remains pending so release is not yet safe.";
  }

  if (input.poolingThreshold.poolingStatus === "ISOLATED" && qualityGateStatus === "QUALITY_PASSED") {
    releaseSafe = true;
    reason = "Quality passed and isolated movement may proceed without pooling dependency.";
  }

  const artifact: QualityPreservationGateArtifact = {
    qualityGateId: makeQualityGateId(input.subjectId),
    subjectId: input.subjectId,
    qualityGateStatus,
    qualityScore: input.qualityScore,
    providerReliabilityScore: input.providerReliabilityScore,
    qualityCompositeScore,
    poolingAware: input.poolingThreshold.poolingRecommended,
    releaseSafe,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}