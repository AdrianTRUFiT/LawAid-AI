export function nowIso(): string {
  return new Date().toISOString();
}

export function makePoolingThresholdId(subjectId: string): string {
  return `pooling_threshold_${subjectId}`;
}