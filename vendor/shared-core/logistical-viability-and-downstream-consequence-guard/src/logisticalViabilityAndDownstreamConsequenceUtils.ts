export function nowIso(): string {
  return new Date().toISOString();
}

export function makeLogisticalViabilityId(subjectId: string): string {
  return `logistical_viability_${subjectId}`;
}