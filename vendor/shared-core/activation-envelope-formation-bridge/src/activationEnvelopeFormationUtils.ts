export function nowIso(): string {
  return new Date().toISOString();
}

export function makeActivationEnvelopeId(subjectId: string): string {
  return `activation_envelope_${subjectId}`;
}