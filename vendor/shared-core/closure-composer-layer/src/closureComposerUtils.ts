export function nowIso(): string {
  return new Date().toISOString();
}

export function makeClosureId(subjectId: string, lifecycleState: string): string {
  return `closure_${subjectId}_${lifecycleState}`;
}