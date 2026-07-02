export function nowIso(): string {
  return new Date().toISOString();
}

export function makeVisibilityMeaningId(protectiveStateId: string): string {
  return `safe_ai2_visibility_${protectiveStateId}`;
}