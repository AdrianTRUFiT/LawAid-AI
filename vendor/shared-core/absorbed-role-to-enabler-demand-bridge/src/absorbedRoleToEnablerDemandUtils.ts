export function nowIso(): string {
  return new Date().toISOString();
}

export function makeEnablerDemandId(subjectId: string): string {
  return `enabler_demand_${subjectId}`;
}