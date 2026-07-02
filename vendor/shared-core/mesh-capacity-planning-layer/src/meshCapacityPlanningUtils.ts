export function nowIso(): string {
  return new Date().toISOString();
}

export function makeCapacityPlanId(subjectId: string, regionCount: number): string {
  return `mesh_capacity_${subjectId}_${regionCount}`;
}