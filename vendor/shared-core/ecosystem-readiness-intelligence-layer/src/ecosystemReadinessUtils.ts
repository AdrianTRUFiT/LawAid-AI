export function nowIso(): string {
  return new Date().toISOString();
}

export function makeEcosystemReadinessId(subjectId: string): string {
  return `ecosystem_readiness_${subjectId}`;
}

export function getMaxLayer(scores: Record<string, number>): string {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
}

export function getMinLayer(scores: Record<string, number>): string {
  return Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0];
}