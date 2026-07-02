export function nowIso(): string {
  return new Date().toISOString();
}

export function createId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function cleanName(value: string, fallback: string): string {
  const next = value.trim();
  return next.length > 0 ? next : fallback;
}