import type { ReleaseWindowClass, SourceOption } from "./releaseWindowSourceSelectionTypes.js";

export function nowIso(): string {
  return new Date().toISOString();
}

export function makeSourceSelectionId(subjectId: string): string {
  return `source_selection_${subjectId}`;
}

export function getSourceCompositeScore(source: SourceOption): number {
  return (source.qualityScore * 0.55) + (source.marginScore * 0.45);
}

export function deriveReleaseWindowClass(
  releaseUrgencyScore: number,
  releaseDelayHours: number,
): ReleaseWindowClass {
  if (releaseUrgencyScore >= 0.8 && releaseDelayHours <= 2) {
    return "immediate";
  }

  if (releaseDelayHours <= 24) {
    return "scheduled";
  }

  return "delayed";
}