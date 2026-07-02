export function nowIso(): string {
  return new Date().toISOString();
}

export function makeReceivingEnvironmentHandoffId(subjectId: string): string {
  return `receiving_env_handoff_${subjectId}`;
}