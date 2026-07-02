export function nowIso(): string {
  return new Date().toISOString();
}

export function makePnlGuardId(subjectId: string): string {
  return `pnl_guard_${subjectId}`;
}