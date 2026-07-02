import type {
  DemandPoolingThresholdArtifact,
  DemandPoolingThresholdInput,
  DemandPoolingThresholdResult,
  PoolingStatus,
} from "./demandPoolingThresholdTypes.js";
import {
  makePoolingThresholdId,
  nowIso,
} from "./demandPoolingThresholdUtils.js";

export function runDemandPoolingThreshold(
  input: DemandPoolingThresholdInput,
): DemandPoolingThresholdResult {
  if (!input.inquiryIntelligence) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Demand pooling threshold refused because inquiry intelligence input is missing.",
      },
    };
  }

  if (input.subjectId !== input.inquiryIntelligence.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Demand pooling threshold refused because subject identity does not match inquiry intelligence input.",
      },
    };
  }

  if (!Number.isFinite(input.requiredThreshold) || input.requiredThreshold <= 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "INVALID_THRESHOLD",
        refusalReason: "Demand pooling threshold refused because threshold is invalid.",
      },
    };
  }

  const poolingRecommended = input.inquiryIntelligence.poolingCandidate;
  const thresholdGap = Math.max(0, input.requiredThreshold - input.currentDemandCount);

  let poolingStatus: PoolingStatus;
  let releaseReady = false;
  let reason = "";

  if (!poolingRecommended) {
    poolingStatus = "ISOLATED";
    reason = "Inquiry should remain isolated rather than pooled.";
  } else if (input.currentDemandCount >= input.requiredThreshold) {
    poolingStatus = "POOLING_READY";
    releaseReady = true;
    reason = "Pooling threshold reached and release-ready conditions are satisfied.";
  } else {
    poolingStatus = "POOLING_PENDING";
    reason = "Pooling remains pending until threshold is reached.";
  }

  const artifact: DemandPoolingThresholdArtifact = {
    poolingThresholdId: makePoolingThresholdId(input.subjectId),
    subjectId: input.subjectId,
    poolingStatus,
    currentDemandCount: input.currentDemandCount,
    requiredThreshold: input.requiredThreshold,
    thresholdGap,
    releaseReady,
    poolingRecommended,
    reason,
    createdAt: nowIso(),
  };

  return {
    ok: true,
    artifact,
    refusal: null,
  };
}