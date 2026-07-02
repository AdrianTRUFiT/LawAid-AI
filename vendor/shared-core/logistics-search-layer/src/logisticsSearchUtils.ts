export function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}