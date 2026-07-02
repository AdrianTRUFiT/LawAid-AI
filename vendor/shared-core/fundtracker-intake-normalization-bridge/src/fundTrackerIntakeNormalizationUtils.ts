export function nowIso(): string {
  return new Date().toISOString();
}

export function makeFundTrackerIntakeNormalizationId(subjectId: string): string {
  return `fundtracker_intake_${subjectId}`;
}