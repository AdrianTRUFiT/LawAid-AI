export function nowIso(): string {
  return new Date().toISOString();
}

export function makeOccupancyId(assignmentId: string): string {
  return `occ-${assignmentId}`;
}