export function nowIso(): string {
  return new Date().toISOString();
}

export function makeQualityGateId(subjectId: string): string {
  return `quality_gate_${subjectId}`;
}