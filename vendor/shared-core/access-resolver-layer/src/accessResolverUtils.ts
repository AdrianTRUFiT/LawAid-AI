export function nowIso(): string {
  return new Date().toISOString();
}

export function makeAccessResolverId(subjectId: string, lifecycleState: string): string {
  return `access_resolver_${subjectId}_${lifecycleState}`;
}