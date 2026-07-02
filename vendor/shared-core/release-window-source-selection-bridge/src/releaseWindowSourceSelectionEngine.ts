import type {
  ReleaseWindowSourceSelectionArtifact,
  ReleaseWindowSourceSelectionInput,
  ReleaseWindowSourceSelectionResult,
  SourceOption,
  SourceSelectionStatus,
} from "./releaseWindowSourceSelectionTypes.js";
import {
  deriveReleaseWindowClass,
  getSourceCompositeScore,
  makeSourceSelectionId,
  nowIso,
} from "./releaseWindowSourceSelectionUtils.js";

export function runReleaseWindowSourceSelectionBridge(
  input: ReleaseWindowSourceSelectionInput,
): ReleaseWindowSourceSelectionResult {
  if (!input.bookingReady || !Array.isArray(input.sourceOptions) || input.sourceOptions.length === 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "MISSING_INPUT",
        refusalReason: "Release-window/source-selection bridge refused because booking-ready input or source options are missing.",
      },
    };
  }

  if (input.subjectId !== input.bookingReady.subjectId) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "SUBJECT_MISMATCH",
        refusalReason: "Release-window/source-selection bridge refused because subject identity does not match booking-ready input.",
      },
    };
  }

  if (input.bookingReady.bookingReadyStatus !== "BOOKING_READY") {
    const artifact: ReleaseWindowSourceSelectionArtifact = {
      sourceSelectionId: makeSourceSelectionId(input.subjectId),
      subjectId: input.subjectId,
      sourceSelectionStatus: "SOURCE_HELD",
      selectedSourceId: null,
      selectedSourceType: "none",
      releaseWindowClass: "delayed",
      releaseEligible: false,
      sourceCompositeScore: 0,
      reason: "Booking is not yet ready, so source selection remains held.",
      createdAt: nowIso(),
    };

    return { ok: true, artifact, refusal: null };
  }

  const eligibleType = input.bookingReady.sourcingMode;

  const eligibleSources = input.sourceOptions
    .filter((s) => s.available)
    .filter((s) => eligibleType === "pooled" ? s.sourceType === "pooled" : s.sourceType === "isolated")
    .map((s) => ({ source: s, score: getSourceCompositeScore(s) }))
    .sort((a, b) => b.score - a.score);

  if (eligibleSources.length === 0) {
    return {
      ok: false,
      artifact: null,
      refusal: {
        refusalCode: "NO_ELIGIBLE_SOURCE",
        refusalReason: "Release-window/source-selection bridge refused because no eligible source is available for the booking-ready sourcing mode.",
      },
    };
  }

  const selected = eligibleSources[0];
  const releaseWindowClass = deriveReleaseWindowClass(
    input.releaseUrgencyScore,
    selected.source.releaseDelayHours,
  );

  let sourceSelectionStatus: SourceSelectionStatus = "SOURCE_SELECTED";
  let releaseEligible = true;
  let reason = "Eligible source selected for release.";

  if (releaseWindowClass === "delayed") {
    sourceSelectionStatus = "SOURCE_HELD";
    releaseEligible = false;
    reason = "Eligible source found, but release window remains delayed.";
  }

  const artifact: ReleaseWindowSourceSelectionArtifact = {
    sourceSelectionId: makeSourceSelectionId(input.subjectId),
    subjectId: input.subjectId,
    sourceSelectionStatus,
    selectedSourceId: selected.source.sourceId,
    selectedSourceType: selected.source.sourceType,
    releaseWindowClass,
    releaseEligible,
    sourceCompositeScore: selected.score,
    reason,
    createdAt: nowIso(),
  };

  return { ok: true, artifact, refusal: null };
}