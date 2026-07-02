export function nowIso(): string {
  return new Date().toISOString();
}

export function makeFundTrackerHandoffCandidateId(subjectId: string): string {
  return `fundtracker_handoff_${subjectId}`;
}