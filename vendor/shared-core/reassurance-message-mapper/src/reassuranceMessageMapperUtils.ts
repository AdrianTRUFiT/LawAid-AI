export function nowIso(): string {
  return new Date().toISOString();
}

export function makeReassuranceMessageId(
  subjectId: string,
  accessActivationId: string,
): string {
  return `reassurance_${subjectId}_${accessActivationId}`;
}