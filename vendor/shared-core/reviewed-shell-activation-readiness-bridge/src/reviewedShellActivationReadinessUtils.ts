export function nowIso(): string {
  return new Date().toISOString();
}

export function makeActivationReadinessId(subjectId: string): string {
  return `activation_readiness_${subjectId}`;
}