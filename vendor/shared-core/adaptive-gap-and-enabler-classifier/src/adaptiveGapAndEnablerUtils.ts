export function nowIso(): string {
  return new Date().toISOString();
}

export function makeAdaptiveGapId(subjectId: string): string {
  return `adaptive_gap_${subjectId}`;
}