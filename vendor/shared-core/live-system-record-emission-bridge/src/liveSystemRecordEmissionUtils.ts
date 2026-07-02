export function nowIso(): string {
  return new Date().toISOString();
}

export function makeLiveSystemRecordEmissionId(subjectId: string): string {
  return `live_system_record_${subjectId}`;
}